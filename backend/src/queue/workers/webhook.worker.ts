import { Worker, Job } from 'bullmq';
import { connection, reviewQueue, repoSyncQueue } from '../index';

export const webhookWorker = new Worker('webhook-queue', async (job: Job) => {
  const { event, action, payload } = job.data;
  console.log(`Processing Webhook Event: ${event} - Action: ${action}`);

  if (event === 'pull_request') {
    if (action === 'opened' || action === 'synchronize') {
      console.log(`[Webhook Worker] PR ${action}. Queuing Incremental AI Review...`);
      // Pass PR metadata to the review queue for diff chunking and inline comments
      await reviewQueue.add('incremental-review', {
        pull_number: payload.pull_request.number,
        repo: payload.repository.name,
        owner: payload.repository.owner.login,
        installationId: payload.installation?.id,
        commits: payload.pull_request.commits,
        diff_url: payload.pull_request.diff_url
      });
    }
  } else if (event === 'push') {
    console.log(`[Webhook Worker] Push event detected. Queuing Repo Sync...`);
    await repoSyncQueue.add('sync-repo', {
      repo: payload.repository.name,
      owner: payload.repository.owner.login,
      branch: payload.ref.replace('refs/heads/', '')
    });
  } else if (event === 'repository') {
    // Handling repository renamed, deleted, etc.
  }
}, { connection });

webhookWorker.on('completed', (job) => {
  console.log(`[Webhook Worker] Job ${job.id} completed successfully`);
});
webhookWorker.on('failed', (job, err) => {
  console.error(`[Webhook Worker] Job ${job?.id} failed:`, err.message);
});
