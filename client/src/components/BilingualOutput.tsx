/**
 * Bilingual Output Templates
 * Provides RTL-aware rendering for Arabic and LTR for English
 * Typography: Inter for EN, Cairo for AR
 */

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// Typography configuration
export const TYPOGRAPHY = {
  en: {
    fontFamily: "'Inter', sans-serif",
    direction: 'ltr' as const,
    textAlign: 'left' as const,
  },
  ar: {
    fontFamily: "'Cairo', sans-serif",
    direction: 'rtl' as const,
    textAlign: 'right' as const,
  },
};

// 7-section output template structure
export interface OutputSection {
  id: string;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  citations?: { id: string; source: string; url?: string }[];
}

export interface BilingualOutputProps {
  sections: OutputSection[];
  showBothLanguages?: boolean;
  className?: string;
}

/**
 * Standard 7-section output template
 */
export const STANDARD_SECTIONS = {
  EXECUTIVE_SUMMARY: { id: 'executive_summary', titleEn: 'Executive Summary', titleAr: 'الملخص التنفيذي' },
  KEY_FINDINGS: { id: 'key_findings', titleEn: 'Key Findings', titleAr: 'النتائج الرئيسية' },
  DATA_ANALYSIS: { id: 'data_analysis', titleEn: 'Data Analysis', titleAr: 'تحليل البيانات' },
  METHODOLOGY: { id: 'methodology', titleEn: 'Methodology', titleAr: 'المنهجية' },
  LIMITATIONS: { id: 'limitations', titleEn: 'Limitations & Caveats', titleAr: 'القيود والتحفظات' },
  RECOMMENDATIONS: { id: 'recommendations', titleEn: 'Recommendations', titleAr: 'التوصيات' },
  SOURCES: { id: 'sources', titleEn: 'Sources & Citations', titleAr: 'المصادر والاستشهادات' },
};

/**
 * RTL-aware text container
 */
export function BilingualText({
  textEn,
  textAr,
  className = '',
}: {
  textEn: string;
  textAr: string;
  className?: string;
}) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const typography = isArabic ? TYPOGRAPHY.ar : TYPOGRAPHY.en;
  const text = isArabic ? textAr : textEn;

  return (
    <div
      className={className}
      style={{
        fontFamily: typography.fontFamily,
        direction: typography.direction,
        textAlign: typography.textAlign,
      }}
    >
      {text}
    </div>
  );
}

/**
 * Side-by-side bilingual display
 */
export function BilingualSideBySide({
  textEn,
  textAr,
  className = '',
}: {
  textEn: string;
  textAr: string;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`}>
      <div
        style={{
          fontFamily: TYPOGRAPHY.en.fontFamily,
          direction: TYPOGRAPHY.en.direction,
          textAlign: TYPOGRAPHY.en.textAlign,
        }}
        className="p-4 bg-muted/30 rounded-lg"
      >
        <div className="text-xs text-muted-foreground mb-2">English</div>
        {textEn}
      </div>
      <div
        style={{
          fontFamily: TYPOGRAPHY.ar.fontFamily,
          direction: TYPOGRAPHY.ar.direction,
          textAlign: TYPOGRAPHY.ar.textAlign,
        }}
        className="p-4 bg-muted/30 rounded-lg"
      >
        <div className="text-xs text-muted-foreground mb-2">العربية</div>
        {textAr}
      </div>
    </div>
  );
}

/**
 * Full bilingual output with 7 sections
 */
export function BilingualOutput({ sections, showBothLanguages = false, className = '' }: BilingualOutputProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const typography = isArabic ? TYPOGRAPHY.ar : TYPOGRAPHY.en;

  return (
    <div
      className={`space-y-6 ${className}`}
      style={{
        fontFamily: typography.fontFamily,
        direction: typography.direction,
      }}
    >
      {sections.map((section) => (
        <div key={section.id} className="border-b pb-6 last:border-b-0">
          <h3
            className="text-lg font-semibold mb-3"
            style={{ textAlign: typography.textAlign }}
          >
            {isArabic ? section.titleAr : section.titleEn}
          </h3>
          
          {showBothLanguages ? (
            <BilingualSideBySide
              textEn={section.contentEn}
              textAr={section.contentAr}
            />
          ) : (
            <div
              className="text-muted-foreground leading-relaxed"
              style={{ textAlign: typography.textAlign }}
            >
              {isArabic ? section.contentAr : section.contentEn}
            </div>
          )}
          
          {section.citations && section.citations.length > 0 && (
            <div className="mt-4 pt-3 border-t border-dashed">
              <div className="text-xs text-muted-foreground mb-2">
                {isArabic ? 'المصادر:' : 'Sources:'}
              </div>
              <div className="flex flex-wrap gap-2">
                {section.citations.map((citation) => (
                  <span
                    key={citation.id}
                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                  >
                    [{citation.id}] {citation.source}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * RTL-aware card component
 */
export function BilingualCard({
  titleEn,
  titleAr,
  contentEn,
  contentAr,
  className = '',
  children,
}: {
  titleEn: string;
  titleAr: string;
  contentEn?: string;
  contentAr?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const typography = isArabic ? TYPOGRAPHY.ar : TYPOGRAPHY.en;

  return (
    <div
      className={`bg-card rounded-lg border p-4 ${className}`}
      style={{
        fontFamily: typography.fontFamily,
        direction: typography.direction,
      }}
    >
      <h4
        className="font-medium mb-2"
        style={{ textAlign: typography.textAlign }}
      >
        {isArabic ? titleAr : titleEn}
      </h4>
      {(contentEn || contentAr) && (
        <p
          className="text-sm text-muted-foreground"
          style={{ textAlign: typography.textAlign }}
        >
          {isArabic ? contentAr : contentEn}
        </p>
      )}
      {children}
    </div>
  );
}

/**
 * RTL-aware table component
 */
export function BilingualTable({
  headers,
  rows,
  className = '',
}: {
  headers: { en: string; ar: string }[];
  rows: { en: string; ar: string }[][];
  className?: string;
}) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const typography = isArabic ? TYPOGRAPHY.ar : TYPOGRAPHY.en;

  return (
    <div
      className={`overflow-x-auto ${className}`}
      style={{
        fontFamily: typography.fontFamily,
        direction: typography.direction,
      }}
    >
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-4 py-2 text-sm font-medium"
                style={{ textAlign: typography.textAlign }}
              >
                {isArabic ? header.ar : header.en}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-b-0">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-4 py-2 text-sm"
                  style={{ textAlign: typography.textAlign }}
                >
                  {isArabic ? cell.ar : cell.en}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * RTL mirroring utility for icons and layouts
 */
export function RTLMirror({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <div
      className={className}
      style={{
        transform: isArabic ? 'scaleX(-1)' : 'none',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Generate standard 7-section output template
 */
export function createStandardOutput(data: {
  executiveSummary: { en: string; ar: string };
  keyFindings: { en: string; ar: string };
  dataAnalysis: { en: string; ar: string };
  methodology: { en: string; ar: string };
  limitations: { en: string; ar: string };
  recommendations: { en: string; ar: string };
  sources: { id: string; source: string; url?: string }[];
}): OutputSection[] {
  return [
    {
      ...STANDARD_SECTIONS.EXECUTIVE_SUMMARY,
      contentEn: data.executiveSummary.en,
      contentAr: data.executiveSummary.ar,
    },
    {
      ...STANDARD_SECTIONS.KEY_FINDINGS,
      contentEn: data.keyFindings.en,
      contentAr: data.keyFindings.ar,
    },
    {
      ...STANDARD_SECTIONS.DATA_ANALYSIS,
      contentEn: data.dataAnalysis.en,
      contentAr: data.dataAnalysis.ar,
    },
    {
      ...STANDARD_SECTIONS.METHODOLOGY,
      contentEn: data.methodology.en,
      contentAr: data.methodology.ar,
    },
    {
      ...STANDARD_SECTIONS.LIMITATIONS,
      contentEn: data.limitations.en,
      contentAr: data.limitations.ar,
    },
    {
      ...STANDARD_SECTIONS.RECOMMENDATIONS,
      contentEn: data.recommendations.en,
      contentAr: data.recommendations.ar,
    },
    {
      ...STANDARD_SECTIONS.SOURCES,
      contentEn: 'See citations below',
      contentAr: 'انظر الاستشهادات أدناه',
      citations: data.sources,
    },
  ];
}

export default BilingualOutput;
