import { Queue, Worker, Job } from 'bullmq';
import { connection } from '../../index';
import { ScoreProcessor } from '../../../analytics/processors/score.processor';
import { Repository } from '../../../models/Repository';

export const analyticsQueue = new Queue('nightly-analytics-queue', { connection });

export const analyticsWorker = new Worker('nightly-analytics-queue', async (job: Job) => {
  console.log(`[Nightly Analytics] Starting job ${job.id}`);
  
  if (job.name === 'generate-all-metrics') {
    // 1. Fetch all active repositories
    const repos = await Repository.find({}).limit(50); // limit for phase 5 prototype
    
    // 2. Process each repository sequentially to avoid rate limits
    for (const repo of repos) {
      try {
        await ScoreProcessor.calculateRepositoryHealth(repo.id, repo.fullName || repo.name);
      } catch (error) {
        console.error(`Failed to process repo ${repo.name}:`, error);
      }
    }
    console.log(`[Nightly Analytics] Completed metrics generation for ${repos.length} repos.`);
  }
}, { connection });

// Schedule the cron job to run nightly at 2 AM
export const scheduleNightlyJobs = async () => {
  await analyticsQueue.add('generate-all-metrics', {}, {
    repeat: {
      pattern: '0 2 * * *' // 2 AM every day
    }
  });
  console.log('Scheduled nightly analytics cron job.');
};
