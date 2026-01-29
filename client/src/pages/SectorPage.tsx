/**
 * SectorPage - Dynamic sector page wrapper
 * Uses the SectorPageTemplate with the sector code from URL
 */

import { useRoute } from "wouter";
import { SectorPageTemplate } from "@/components/sectors/SectorPageTemplate";

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

  return <SectorPageTemplate sectorCode={sectorCode} />;
}
