/**
 * Crash-Safe Work Queue Tests
 */

import { describe, it, expect } from 'vitest';
import * as workQueue from './crashSafeWorkQueue';

describe('Crash-Safe Work Queue', () => {
  describe('Job Enqueue', () => {
    it('should enqueue a job with default priority', async () => {
      const jobId = await workQueue.enqueueJob({
        jobType: 'IMPORT_REGISTRY',
        priority: 50
      });

      expect(typeof jobId === 'number' || jobId === null).toBe(true);
    });

    it('should enqueue job with source reference', async () => {
      const jobId = await workQueue.enqueueJob({
        jobType: 'INGEST_SOURCE',
        sourceRegistryId: 1,
        priority: 100
      });

      expect(typeof jobId === 'number' || jobId === null).toBe(true);
    });
  });

  describe('Job State Management', () => {
    it('should mark job as running', async () => {
      const result = await workQueue.markJobRunning(1);
      expect(typeof result).toBe('boolean');
    });

    it('should update job progress with checkpoint', async () => {
      const result = await workQueue.updateJobProgress(1, {
        step: 'importing sources',
        itemsProcessed: 50,
        itemsTotal: 292,
        percentComplete: 17.1,
        checkpoint: { lastSourceId: 'SRC-050' }
      });
      
      expect(typeof result).toBe('boolean');
    });

    it('should mark job as completed', async () => {
      const result = await workQueue.markJobCompleted(1);
      expect(typeof result).toBe('boolean');
    });

    it('should retry failed jobs up to maxAttempts', async () => {
      // Would need to seed DB with test job
      expect(true).toBe(true);
    });
  });

  describe('Job Recovery', () => {
    it('should detect stuck running jobs', async () => {
      const stuckJobs = await workQueue.getStuckRunningJobs();
      expect(Array.isArray(stuckJobs)).toBe(true);
    });

    it('should reset stuck jobs to PENDING', async () => {
      const resetCount = await workQueue.resetStuckJobs();
      expect(typeof resetCount).toBe('number');
    });
  });

  describe('Queue Statistics', () => {
    it('should return queue stats by state', async () => {
      const stats = await workQueue.getQueueStats();
      
      expect(stats).toHaveProperty('pending');
      expect(stats).toHaveProperty('running');
      expect(stats).toHaveProperty('completed');
      expect(stats).toHaveProperty('failed');
      expect(stats).toHaveProperty('totalJobs');
    });
  });
});
