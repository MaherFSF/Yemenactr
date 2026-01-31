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
