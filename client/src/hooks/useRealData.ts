/**
 * YETO Platform - Real Data Hooks
 * Yemen Economic Transparency Observatory
 * 
 * React hooks for fetching real data from external sources
 * via the tRPC ingestion router
 */

import { trpc } from '@/lib/trpc';

// ============================================
// Get Available Connectors
// ============================================

export function useConnectors() {
  return trpc.ingestion.getConnectors.useQuery(undefined, {
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });
}

// ============================================
// Get Ingestion Progress
// ============================================

export function useIngestionProgress() {
  return trpc.ingestion.getProgress.useQuery(undefined, {
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: false,
    refetchInterval: 5000, // Poll every 5 seconds when active
  });
}

// ============================================
// Get Ingestion Summary
// ============================================

export function useIngestionSummary() {
  return trpc.ingestion.getSummary.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// ============================================
// Get All Jobs
// ============================================

export function useIngestionJobs() {
  return trpc.ingestion.getJobs.useQuery(undefined, {
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: false,
  });
}

// ============================================
// Check if Ingestion is Running
// ============================================

export function useIngestionStatus() {
  return trpc.ingestion.isRunning.useQuery(undefined, {
    staleTime: 1000 * 10, // 10 seconds
    refetchOnWindowFocus: false,
    refetchInterval: 3000, // Poll every 3 seconds
  });
}

// ============================================
// Get Schedules
// ============================================

export function useIngestionSchedules() {
  return trpc.ingestion.getSchedules.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// ============================================
// Mutation Hooks
// ============================================

export function useTestConnections() {
  return trpc.ingestion.testConnections.useMutation();
}

export function useRunFullIngestion() {
  return trpc.ingestion.runFullIngestion.useMutation();
}

export function useRunYearIngestion() {
  return trpc.ingestion.runYearIngestion.useMutation();
}

export function useRunMonthIngestion() {
  return trpc.ingestion.runMonthIngestion.useMutation();
}

export function useRunIncrementalUpdate() {
  return trpc.ingestion.runIncrementalUpdate.useMutation();
}

export function useSetupSchedule() {
  return trpc.ingestion.setupSchedule.useMutation();
}

export function useRunSingleConnector() {
  return trpc.ingestion.runSingleConnector.useMutation();
}


// ============================================
// Key Indicators Hook
// ============================================

interface KeyIndicator {
  code: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  confidence: 'A' | 'B' | 'C' | 'D';
  source: string;
  lastUpdated: string;
}

interface KeyIndicatorsData {
  indicators: KeyIndicator[];
  retrievedAt: string;
}

export function useKeyIndicators() {
  return trpc.legacyIngestion.getKeyIndicators.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// ============================================
// ReliefWeb Reports Hook
// ============================================

export function useReliefWebReports() {
  return trpc.legacyIngestion.fetchReliefWeb.useQuery({ limit: 10 }, {
    staleTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
  });
}

// ============================================
// Data Source Status Hook
// ============================================

export function useDataSourceStatus() {
  return trpc.legacyIngestion.getSourceStatus.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// ============================================
// Utility Functions
// ============================================

export function formatIndicatorValue(value: number, unit: string): string {
  if (unit === '%') {
    return `${value.toFixed(1)}%`;
  }
  if (unit === 'USD' || unit === 'YER') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: unit === 'YER' ? 'YER' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(2);
}

export function getConfidenceColor(confidence: 'A' | 'B' | 'C' | 'D'): string {
  switch (confidence) {
    case 'A': return 'bg-green-500';
    case 'B': return 'bg-blue-500';
    case 'C': return 'bg-yellow-500';
    case 'D': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}

export function getConfidenceLabel(confidence: 'A' | 'B' | 'C' | 'D'): string {
  switch (confidence) {
    case 'A': return 'High Confidence';
    case 'B': return 'Good Confidence';
    case 'C': return 'Moderate Confidence';
    case 'D': return 'Low Confidence';
    default: return 'Unknown';
  }
}
