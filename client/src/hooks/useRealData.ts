/**
 * YETO Platform - Real Data Hooks
 * Yemen Economic Transparency Observatory
 * 
 * React hooks for fetching real data from external sources
 * via the tRPC ingestion router
 */

import { trpc } from '@/lib/trpc';

// ============================================
// World Bank Data Hook
// ============================================

export function useWorldBankIndicator(indicatorCode: string) {
  return trpc.ingestion.fetchWorldBank.useQuery(
    { indicatorCode },
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      refetchOnWindowFocus: false,
      enabled: !!indicatorCode,
    }
  );
}

// ============================================
// HDX Humanitarian Data Hook
// ============================================

export function useHDXData(dataType: 'population' | 'food-security' | 'humanitarian-needs') {
  return trpc.ingestion.fetchHDX.useQuery(
    { dataType },
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      refetchOnWindowFocus: false,
    }
  );
}

// ============================================
// OCHA Funding Data Hook
// ============================================

export function useOCHAFunding(year: number = 2024) {
  return trpc.ingestion.fetchOCHAFunding.useQuery(
    { year },
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      refetchOnWindowFocus: false,
    }
  );
}

// ============================================
// ReliefWeb Reports Hook
// ============================================

export function useReliefWebReports(query?: string, limit: number = 20) {
  return trpc.ingestion.fetchReliefWeb.useQuery(
    { query, limit },
    {
      staleTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
    }
  );
}

// ============================================
// Data Source Status Hook
// ============================================

export function useDataSourceStatus() {
  return trpc.ingestion.getSourceStatus.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// ============================================
// Key Indicators Hook (Multiple World Bank indicators)
// ============================================

export function useKeyIndicators() {
  return trpc.ingestion.getKeyIndicators.useQuery(undefined, {
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
    refetchOnWindowFocus: false,
  });
}

// ============================================
// Cached Data Hook
// ============================================

export function useCachedData(sourceId?: string, indicatorCode?: string) {
  return trpc.ingestion.getCachedData.useQuery(
    { sourceId, indicatorCode },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );
}

// ============================================
// Full Ingestion Mutation (Admin only)
// ============================================

export function useRunIngestion() {
  const utils = trpc.useUtils();
  
  return trpc.ingestion.runFullIngestion.useMutation({
    onSuccess: () => {
      // Invalidate all ingestion queries after successful run
      utils.ingestion.invalidate();
    },
  });
}

// ============================================
// Helper: Format indicator value for display
// ============================================

export function formatIndicatorValue(value: number | null | undefined, unit: string): string {
  if (value === null || value === undefined) return 'N/A';
  
  // Format based on unit type
  if (unit === '%') {
    return `${value.toFixed(1)}%`;
  }
  
  if (unit === 'USD' || unit === 'YER') {
    if (Math.abs(value) >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B ${unit}`;
    }
    if (Math.abs(value) >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M ${unit}`;
    }
    if (Math.abs(value) >= 1e3) {
      return `${(value / 1e3).toFixed(1)}K ${unit}`;
    }
    return `${value.toFixed(0)} ${unit}`;
  }
  
  if (unit === 'people' || unit === 'persons') {
    if (Math.abs(value) >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M`;
    }
    if (Math.abs(value) >= 1e3) {
      return `${(value / 1e3).toFixed(1)}K`;
    }
    return value.toFixed(0);
  }
  
  // Default formatting
  if (Math.abs(value) >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }
  
  return value.toFixed(2);
}

// ============================================
// Helper: Get confidence badge color
// ============================================

export function getConfidenceColor(confidence: string): string {
  switch (confidence) {
    case 'A':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'B':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'C':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'D':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
}

// ============================================
// Helper: Get confidence label
// ============================================

export function getConfidenceLabel(confidence: string): string {
  switch (confidence) {
    case 'A':
      return 'High Confidence';
    case 'B':
      return 'Good Confidence';
    case 'C':
      return 'Moderate Confidence';
    case 'D':
      return 'Low Confidence';
    default:
      return 'Unknown';
  }
}
