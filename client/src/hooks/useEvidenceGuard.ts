/**
 * TRUTH-NATIVE Evidence Guard Hook
 * 
 * Enforces that KPI values are only displayed when:
 * 1. Value is DB-driven (not hardcoded)
 * 2. evidence_pack_id exists
 * 3. License allows display
 * 
 * Otherwise, returns a GAP placeholder with ticket ID
 */

import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface EvidenceGuardInput {
  value: string | number | null | undefined;
  evidencePackId?: string | null;
  isDbDriven?: boolean;
  licenseAllows?: boolean;
  indicatorCode?: string;
  sectorCode?: string;
}

export interface EvidenceGuardResult {
  displayValue: string;
  hasEvidence: boolean;
  gapId: string | null;
  showGapWarning: boolean;
  tooltipMessage: string;
}

// Generate a deterministic GAP ID based on indicator/sector
const generateGapIdFromContext = (indicatorCode?: string, sectorCode?: string): string => {
  const context = `${indicatorCode || 'UNK'}-${sectorCode || 'UNK'}`;
  const hash = context.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  return `GAP-${Math.abs(hash).toString(36).toUpperCase().substring(0, 8)}`;
};

export function useEvidenceGuard({
  value,
  evidencePackId,
  isDbDriven = true,
  licenseAllows = true,
  indicatorCode,
  sectorCode,
}: EvidenceGuardInput): EvidenceGuardResult {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  return useMemo(() => {
    // Check if value exists and is valid
    const hasValue = value !== null && value !== undefined && value !== "" && value !== "-";
    
    // Check if evidence exists
    const hasEvidenceId = !!evidencePackId && evidencePackId !== "unknown";
    
    // All conditions must be met for valid display
    const hasEvidence = hasValue && hasEvidenceId && isDbDriven && licenseAllows;

    if (hasEvidence) {
      return {
        displayValue: String(value),
        hasEvidence: true,
        gapId: null,
        showGapWarning: false,
        tooltipMessage: isArabic 
          ? "بيانات موثقة مع أدلة"
          : "Verified data with evidence",
      };
    }

    // Generate GAP ID for missing evidence
    const gapId = generateGapIdFromContext(indicatorCode, sectorCode);

    // Determine reason for gap
    let reason: string;
    if (!hasValue) {
      reason = isArabic ? "قيمة غير متوفرة" : "Value not available";
    } else if (!hasEvidenceId) {
      reason = isArabic ? "لا توجد حزمة أدلة" : "No evidence pack";
    } else if (!isDbDriven) {
      reason = isArabic ? "بيانات غير موثقة" : "Data not from database";
    } else if (!licenseAllows) {
      reason = isArabic ? "الترخيص لا يسمح بالعرض" : "License restricts display";
    } else {
      reason = isArabic ? "سبب غير معروف" : "Unknown reason";
    }

    return {
      displayValue: `— | ${gapId}`,
      hasEvidence: false,
      gapId,
      showGapWarning: true,
      tooltipMessage: `${reason} (${gapId})`,
    };
  }, [value, evidencePackId, isDbDriven, licenseAllows, indicatorCode, sectorCode, isArabic]);
}

/**
 * Simple guard function for non-hook contexts
 */
export function guardValue(
  value: string | number | null | undefined,
  evidencePackId?: string | null,
  indicatorCode?: string,
  sectorCode?: string
): { display: string; hasEvidence: boolean; gapId: string | null } {
  const hasValue = value !== null && value !== undefined && value !== "" && value !== "-";
  const hasEvidenceId = !!evidencePackId && evidencePackId !== "unknown";
  
  if (hasValue && hasEvidenceId) {
    return {
      display: String(value),
      hasEvidence: true,
      gapId: null,
    };
  }

  const gapId = generateGapIdFromContext(indicatorCode, sectorCode);
  return {
    display: `— | ${gapId}`,
    hasEvidence: false,
    gapId,
  };
}

export default useEvidenceGuard;
