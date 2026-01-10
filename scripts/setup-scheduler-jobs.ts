/**
 * Setup Scheduler Jobs for Auto-Update from World Bank/IMF
 * This script creates scheduled jobs to automatically fetch and update
 * Yemen economic data from various sources every 2-3 days
 */

import { getDb } from '../server/db';
import { schedulerJobs } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

interface SchedulerJobInput {
  jobName: string;
  jobType: 'data_refresh' | 'signal_detection' | 'publication' | 'backup' | 'cleanup';
  cronExpression: string;
  isEnabled: boolean;
  config: Record<string, unknown>;
  nextRunAt: Date;
}

const SCHEDULER_JOBS: SchedulerJobInput[] = [
  // World Bank Data Updates
  {
    jobName: 'world_bank_gdp_update',
    jobType: 'data_refresh',
    cronExpression: '0 0 */2 * *', // Every 2 days at midnight
    isEnabled: true,
    config: {
      source: 'World Bank',
      description: 'Fetch latest GDP data from World Bank API for Yemen',
      endpoint: 'https://api.worldbank.org/v2/country/YEM/indicator/NY.GDP.MKTP.CD',
      indicators: ['NY.GDP.MKTP.CD', 'NY.GDP.MKTP.KD.ZG'],
      format: 'json'
    },
    nextRunAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  },
  {
    jobName: 'world_bank_inflation_update',
    jobType: 'data_refresh',
    cronExpression: '0 1 */2 * *', // Every 2 days at 1 AM
    isEnabled: true,
    config: {
      source: 'World Bank',
      description: 'Fetch latest inflation data from World Bank API',
      endpoint: 'https://api.worldbank.org/v2/country/YEM/indicator/FP.CPI.TOTL.ZG',
      indicators: ['FP.CPI.TOTL.ZG', 'FP.CPI.TOTL'],
      format: 'json'
    },
    nextRunAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000)
  },
  {
    jobName: 'world_bank_trade_update',
    jobType: 'data_refresh',
    cronExpression: '0 2 */2 * *', // Every 2 days at 2 AM
    isEnabled: true,
    config: {
      source: 'World Bank',
      description: 'Fetch latest trade balance data from World Bank API',
      endpoint: 'https://api.worldbank.org/v2/country/YEM/indicator/NE.EXP.GNFS.CD',
      indicators: ['NE.EXP.GNFS.CD', 'NE.IMP.GNFS.CD', 'BN.GSR.GNFS.CD'],
      format: 'json'
    },
    nextRunAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000)
  },
  
  // IMF Data Updates
  {
    jobName: 'imf_weo_update',
    jobType: 'data_refresh',
    cronExpression: '0 3 */3 * *', // Every 3 days at 3 AM
    isEnabled: true,
    config: {
      source: 'IMF',
      description: 'Fetch World Economic Outlook data for Yemen from IMF',
      endpoint: 'https://www.imf.org/external/datamapper/api/v1/NGDP_RPCH/YEM',
      indicators: ['NGDP_RPCH', 'PCPIPCH', 'BCA_NGDPD'],
      format: 'json'
    },
    nextRunAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  },
  {
    jobName: 'imf_exchange_rate_update',
    jobType: 'data_refresh',
    cronExpression: '0 4 * * *', // Daily at 4 AM
    isEnabled: true,
    config: {
      source: 'IMF',
      description: 'Fetch exchange rate data from IMF IFS database',
      endpoint: 'https://www.imf.org/external/datamapper/api/v1/ENDA_XDC_USD_RATE/YEM',
      indicators: ['ENDA_XDC_USD_RATE'],
      format: 'json'
    },
    nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  
  // UN/OCHA Humanitarian Data Updates
  {
    jobName: 'ocha_humanitarian_update',
    jobType: 'data_refresh',
    cronExpression: '0 5 */2 * *', // Every 2 days at 5 AM
    isEnabled: true,
    config: {
      source: 'OCHA',
      description: 'Fetch humanitarian needs data from OCHA HDX',
      endpoint: 'https://data.humdata.org/api/3/action/package_search',
      query: 'yemen economic',
      format: 'json'
    },
    nextRunAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000)
  },
  {
    jobName: 'wfp_food_prices_update',
    jobType: 'data_refresh',
    cronExpression: '0 6 */2 * *', // Every 2 days at 6 AM
    isEnabled: true,
    config: {
      source: 'WFP',
      description: 'Fetch food price monitoring data from WFP VAM',
      endpoint: 'https://api.vam.wfp.org/MarketPrices/v1/MarketPrices',
      country: 'YEM',
      format: 'json'
    },
    nextRunAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000)
  },
  
  // IPC Food Security Updates
  {
    jobName: 'ipc_food_security_update',
    jobType: 'data_refresh',
    cronExpression: '0 7 1,15 * *', // 1st and 15th of each month at 7 AM
    isEnabled: true,
    config: {
      source: 'IPC',
      description: 'Fetch IPC food security classification data for Yemen',
      endpoint: 'https://www.ipcinfo.org/ipc-country-analysis/api/v1/country/YEM',
      format: 'json'
    },
    nextRunAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  
  // Central Bank of Yemen Updates
  {
    jobName: 'cby_exchange_rate_update',
    jobType: 'data_refresh',
    cronExpression: '0 8 * * *', // Daily at 8 AM
    isEnabled: true,
    config: {
      source: 'CBY',
      description: 'Fetch official exchange rate from Central Bank of Yemen',
      endpoint: 'https://cby-ye.com/api/exchange-rates',
      format: 'json'
    },
    nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000)
  },
  
  // ACLED Conflict Data Updates
  {
    jobName: 'acled_conflict_update',
    jobType: 'signal_detection',
    cronExpression: '0 9 */3 * *', // Every 3 days at 9 AM
    isEnabled: true,
    config: {
      source: 'ACLED',
      description: 'Fetch conflict event data from ACLED for Yemen',
      endpoint: 'https://api.acleddata.com/acled/read',
      country: 'Yemen',
      format: 'json'
    },
    nextRunAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000)
  },
  
  // Research Publication Updates
  {
    jobName: 'research_publications_scan',
    jobType: 'publication',
    cronExpression: '0 10 * * 1', // Every Monday at 10 AM
    isEnabled: true,
    config: {
      description: 'Check for new research publications from partner organizations',
      sources: [
        'World Bank',
        'IMF',
        'Sana\'a Center',
        'Chatham House',
        'CARPO',
        'Yemen Policy Center'
      ],
      keywords: ['Yemen', 'economy', 'economic', 'humanitarian', 'conflict']
    },
    nextRunAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  
  // Data Quality Check
  {
    jobName: 'data_quality_check',
    jobType: 'signal_detection',
    cronExpression: '0 11 * * 0', // Every Sunday at 11 AM
    isEnabled: true,
    config: {
      description: 'Run data quality checks and update confidence ratings',
      checks: [
        'missing_values',
        'outlier_detection',
        'cross_source_validation',
        'temporal_consistency'
      ]
    },
    nextRunAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  
  // Database Backup
  {
    jobName: 'database_backup',
    jobType: 'backup',
    cronExpression: '0 0 * * *', // Daily at midnight
    isEnabled: true,
    config: {
      description: 'Create daily backup of database',
      retention_days: 30
    },
    nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  
  // Cleanup Old Data
  {
    jobName: 'cleanup_old_logs',
    jobType: 'cleanup',
    cronExpression: '0 2 * * 0', // Every Sunday at 2 AM
    isEnabled: true,
    config: {
      description: 'Clean up old logs and temporary data',
      retention_days: 90
    },
    nextRunAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }
];

async function setupSchedulerJobs() {
  console.log('Setting up scheduler jobs for auto-update...\n');
  
  const db = await getDb();
  
  let created = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const job of SCHEDULER_JOBS) {
    try {
      // Check if job already exists
      const existing = await db.select().from(schedulerJobs).where(eq(schedulerJobs.jobName, job.jobName));
      
      if (existing.length > 0) {
        console.log(`⏭️  Skipped: ${job.jobName} (already exists)`);
        skipped++;
        continue;
      }
      
      // Insert new job
      await db.insert(schedulerJobs).values({
        jobName: job.jobName,
        jobType: job.jobType,
        cronExpression: job.cronExpression,
        isEnabled: job.isEnabled,
        config: job.config,
        nextRunAt: job.nextRunAt,
        runCount: 0,
        failCount: 0
      });
      
      console.log(`✅ Created: ${job.jobName}`);
      console.log(`   Type: ${job.jobType}`);
      console.log(`   Schedule: ${job.cronExpression}`);
      console.log(`   Next run: ${job.nextRunAt.toISOString()}`);
      created++;
    } catch (error) {
      console.error(`❌ Failed: ${job.jobName} - ${error}`);
      failed++;
    }
  }
  
  console.log('\n=== Scheduler Jobs Setup Summary ===');
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total jobs: ${SCHEDULER_JOBS.length}`);
  
  // List all active jobs
  const allJobs = await db.select().from(schedulerJobs).where(eq(schedulerJobs.isEnabled, true));
  
  console.log('\n=== Active Scheduler Jobs ===');
  for (const job of allJobs) {
    console.log(`- ${job.jobName} (${job.jobType}): ${job.cronExpression}`);
  }
  
  process.exit(0);
}

setupSchedulerJobs().catch(console.error);
