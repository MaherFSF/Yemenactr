/**
 * YETO Scheduler Initialization
 * 
 * Initializes and starts the automated ingestion scheduler
 * Run this on server startup
 */

import { ingestionScheduler } from './services/ingestion-scheduler';

/**
 * Initialize and start the scheduler
 */
export async function initializeScheduler(): Promise<void> {
  try {
    console.log('\n🚀 Initializing YETO Ingestion Scheduler...\n');

    // Initialize scheduler with all sources
    await ingestionScheduler.initialize();

    // Start the scheduler
    await ingestionScheduler.start();

    // Get status
    const status = ingestionScheduler.getStatus();
    console.log('\n✅ Scheduler is running!');
    console.log(`   Total sources: ${status.totalSources}`);
    console.log(`   Active sources: ${status.activeSources}`);
    console.log(`   Next 10 scheduled runs:\n`);

    status.nextRuns.forEach((run, index) => {
      const timeUntil = new Date(run.nextRun).getTime() - Date.now();
      const hours = Math.floor(timeUntil / (1000 * 60 * 60));
      const minutes = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));

      console.log(
        `   ${index + 1}. ${run.sourceName} - ${new Date(run.nextRun).toISOString()} (in ${hours}h ${minutes}m)`
      );
    });

    console.log('\n');
  } catch (error) {
    console.error('❌ Failed to initialize scheduler:', error);
    throw error;
  }
}

// Export for use in server startup
export default initializeScheduler;
