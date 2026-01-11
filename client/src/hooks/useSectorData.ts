import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

export interface SectorDataPoint {
  year: string;
  value: number;
  regime: "aden" | "sanaa";
  source: string;
  sourceUrl?: string;
  confidence: string;
}

export interface SectorIndicator {
  code: string;
  nameEn: string;
  nameAr: string;
  unit: string;
  frequency: string;
  latestValue?: number;
  latestDate?: Date;
  source?: string;
  confidence?: string;
  trend?: number[];
}

export interface SectorAlert {
  id: number;
  titleEn: string;
  titleAr: string;
  type: "error" | "warning" | "info";
  date: Date;
}

export function useSectorData(sectorCode: string, regimeTag: "aden_irg" | "sanaa_defacto" | "both" = "both") {
  const { data, isLoading, error } = trpc.sectors.getSectorData.useQuery({
    sectorCode,
    regimeTag,
  });

  // Transform time series data into chart-friendly format
  const chartData = useMemo(() => {
    if (!data?.timeSeries) return {};

    const grouped: Record<string, Record<string, { aden?: number; sanaa?: number; source?: string }>> = {};

    for (const point of data.timeSeries) {
      const year = new Date(point.date).getFullYear().toString();
      const code = point.indicatorCode;

      if (!grouped[code]) grouped[code] = {};
      if (!grouped[code][year]) grouped[code][year] = {};

      if (point.regimeTag === "aden_irg") {
        grouped[code][year].aden = parseFloat(point.value);
        grouped[code][year].source = point.sourceName;
      } else {
        grouped[code][year].sanaa = parseFloat(point.value);
        if (!grouped[code][year].source) {
          grouped[code][year].source = point.sourceName;
        }
      }
    }

    // Convert to array format for charts
    const result: Record<string, Array<{ year: string; aden?: number; sanaa?: number; source?: string }>> = {};
    for (const [code, years] of Object.entries(grouped)) {
      result[code] = Object.entries(years)
        .map(([year, values]) => ({ year, ...values }))
        .sort((a, b) => parseInt(a.year) - parseInt(b.year));
    }

    return result;
  }, [data?.timeSeries]);

  // Get latest values for each indicator
  const latestValues = useMemo(() => {
    if (!data?.timeSeries) return {};

    const latest: Record<string, { aden?: { value: number; date: Date; source: string; confidence: string }; sanaa?: { value: number; date: Date; source: string; confidence: string } }> = {};

    for (const point of data.timeSeries) {
      const code = point.indicatorCode;
      const regime = point.regimeTag === "aden_irg" ? "aden" : "sanaa";

      if (!latest[code]) latest[code] = {};

      const existing = latest[code][regime];
      const pointDate = new Date(point.date);

      if (!existing || pointDate > existing.date) {
        latest[code][regime] = {
          value: parseFloat(point.value),
          date: pointDate,
          source: point.sourceName || "Unknown",
          confidence: point.confidenceRating || "C",
        };
      }
    }

    return latest;
  }, [data?.timeSeries]);

  // Transform alerts
  const alerts = useMemo(() => {
    if (!data?.alerts) return [];

    return data.alerts.map((alert: any) => ({
      id: alert.id,
      titleEn: alert.titleEn,
      titleAr: alert.titleAr,
      type: alert.impactLevel === "critical" ? "error" : alert.impactLevel === "high" ? "warning" : "info",
      date: new Date(alert.eventDate),
    }));
  }, [data?.alerts]);

  return {
    indicators: data?.indicators || [],
    timeSeries: data?.timeSeries || [],
    chartData,
    latestValues,
    alerts,
    sources: data?.sources || [],
    isLoading,
    error,
  };
}

// Hook for getting specific indicator time series
export function useIndicatorTimeSeries(
  indicatorCodes: string[],
  regimeTag: "aden_irg" | "sanaa_defacto" | "both" = "both",
  startYear?: number,
  endYear?: number
) {
  const { data, isLoading, error } = trpc.sectors.getIndicatorTimeSeries.useQuery({
    indicatorCodes,
    regimeTag,
    startYear,
    endYear,
  });

  // Transform to chart format
  const chartData = useMemo(() => {
    if (!data) return [];

    const grouped: Record<string, { year: string; aden?: number; sanaa?: number; source?: string }> = {};

    for (const point of data) {
      const year = new Date(point.date).getFullYear().toString();

      if (!grouped[year]) grouped[year] = { year };

      if (point.regimeTag === "aden_irg") {
        grouped[year].aden = parseFloat(point.value);
        grouped[year].source = point.sourceName;
      } else {
        grouped[year].sanaa = parseFloat(point.value);
        if (!grouped[year].source) {
          grouped[year].source = point.sourceName;
        }
      }
    }

    return Object.values(grouped).sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }, [data]);

  return {
    data: data || [],
    chartData,
    isLoading,
    error,
  };
}

// Helper to format indicator value with unit
export function formatIndicatorValue(value: number | undefined, unit: string): string {
  if (value === undefined) return "N/A";

  switch (unit) {
    case "%":
      return `${value.toFixed(1)}%`;
    case "YER":
    case "YER/USD":
      return value.toLocaleString() + " YER";
    case "USD":
      return "$" + value.toLocaleString();
    case "USD millions":
      return "$" + value.toLocaleString() + "M";
    case "USD billions":
      return "$" + value.toFixed(1) + "B";
    case "millions":
      return value.toFixed(1) + "M";
    case "index":
      return value.toFixed(1);
    default:
      return value.toLocaleString() + (unit ? ` ${unit}` : "");
  }
}

// Helper to get confidence badge color
export function getConfidenceColor(confidence: string): string {
  switch (confidence) {
    case "A":
      return "bg-green-500";
    case "B":
      return "bg-yellow-500";
    case "C":
      return "bg-orange-500";
    case "D":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}
