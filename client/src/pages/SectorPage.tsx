/**
 * SectorPage - Dynamic sector page wrapper
 * Uses the SectorPageTemplate with the sector code from URL
 * For macro sector, uses the enhanced MacroIntelligenceWall component
 */

import { useRoute } from "wouter";
import { SectorPageTemplate } from "@/components/sectors/SectorPageTemplate";
import MacroIntelligenceWall from "@/components/sectors/MacroIntelligenceWall";
import PricesIntelligenceWall from "@/components/sectors/PricesIntelligenceWall";
import BankingIntelligenceWall from "@/components/sectors/BankingIntelligenceWall";
import TradeIntelligenceWall from "@/components/sectors/TradeIntelligenceWall";
import HumanitarianIntelligenceWall from "@/components/sectors/HumanitarianIntelligenceWall";
import EnergyIntelligenceWall from "@/components/sectors/EnergyIntelligenceWall";
import FoodSecurityIntelligenceWall from "@/components/sectors/FoodSecurityIntelligenceWall";
import LaborMarketIntelligenceWall from "@/components/sectors/LaborMarketIntelligenceWall";

// Sectors that use specialized intelligence wall components
const SPECIALIZED_SECTORS: Record<string, React.ComponentType<any>> = {
  'macro': MacroIntelligenceWall,
  'macroeconomy': MacroIntelligenceWall,
  'growth': MacroIntelligenceWall,
  'prices': PricesIntelligenceWall,
  'cost-of-living': PricesIntelligenceWall,
  'inflation': PricesIntelligenceWall,
  'banking': BankingIntelligenceWall,
  'finance': BankingIntelligenceWall,
  'financial': BankingIntelligenceWall,
  'trade': TradeIntelligenceWall,
  'ports': TradeIntelligenceWall,
  'imports': TradeIntelligenceWall,
  'exports': TradeIntelligenceWall,
  'humanitarian': HumanitarianIntelligenceWall,
  'aid': HumanitarianIntelligenceWall,
  'relief': HumanitarianIntelligenceWall,
  'energy': EnergyIntelligenceWall,
  'fuel': EnergyIntelligenceWall,
  'electricity': EnergyIntelligenceWall,
  'power': EnergyIntelligenceWall,
  'food-security': FoodSecurityIntelligenceWall,
  'food': FoodSecurityIntelligenceWall,
  'agriculture': FoodSecurityIntelligenceWall,
  'labor': LaborMarketIntelligenceWall,
  'employment': LaborMarketIntelligenceWall,
  'jobs': LaborMarketIntelligenceWall,
  'workforce': LaborMarketIntelligenceWall,
  // Currency uses the standalone Currency page component
};

export default function SectorPage() {
  const [, params] = useRoute("/sectors/:sectorCode");
  const sectorCode = params?.sectorCode || '';

  if (!sectorCode) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold text-destructive">Sector not found</h1>
      </div>
    );
  }

  // Check if this sector has a specialized component
  const SpecializedComponent = SPECIALIZED_SECTORS[sectorCode.toLowerCase()];
  
  if (SpecializedComponent) {
    return <SpecializedComponent regime="both" />;
  }

  return <SectorPageTemplate sectorCode={sectorCode} />;
}
