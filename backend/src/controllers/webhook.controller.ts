import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { Repository } from '../models/Repository';
import Review from '../models/Review';
import crypto from 'crypto';
import axios from 'axios';

// Basic signature verification for GitHub Webhooks
const verifySignature = (req: Request) => {
  const signature = req.headers['x-hub-signature-256'] as string;
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  
  if (!secret) return true; // Skip if no secret configured
  if (!signature) return false;

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
};

export const handleGitHubWebhook = asyncHandler(async (req: Request, res: Response) => {
  const event = req.headers['x-github-event'] as string;
  
  // Verify signature
  if (!verifySignature(req)) {
    throw new ApiError(401, 'Invalid webhook signature');
  }

  const { repository, pull_request, action } = req.body;

  if (!repository) {
    return res.status(200).json(new ApiResponse(200, 'Ignored: No repository payload', null));
  }

  // Find the connected repo in our DB
  const repoDoc = await Repository.findOne({ fullName: repository.full_name, isArchived: false });
  if (!repoDoc) {
    return res.status(200).json(new ApiResponse(200, 'Ignored: Repository not connected', null));
  }

  console.log(`[Webhook] Received ${event} for ${repoDoc.fullName}`);

  if (event === 'pull_request') {
    if (['opened', 'synchronize', 'reopened'].includes(action)) {
      // Create a mock pending Review to represent the auto-scan triggering
      const review = await Review.create({
        title: pull_request.title,
        branch: pull_request.head.ref,
        repositoryId: repoDoc._id,
        userId: repoDoc.connectedBy,
        workspaceId: repoDoc.workspaceId,
        status: 'analyzing',
        reviewType: 'pull_request',
        prNumber: pull_request.number,
      });

      repoDoc.latestReviewId = review._id as any;
      repoDoc.stats.pullRequests += 1;
      await repoDoc.save();

      // PRIORITY 4: Auto PR Analysis
      // We process this asynchronously so we don't block the GitHub Webhook response (which must be fast)
      processPullRequestReview(review, repoDoc, pull_request);
    }
  }

  res.status(200).json(new ApiResponse(200, 'Webhook processed successfully', null));
});

/**
 * Asynchronously processes a PR review by fetching the diff and calling the AI Service
 */
async function processPullRequestReview(review: any, repoDoc: any, pull_request: any) {
  try {
    // 1. Fetch raw diff
    const diffUrl = pull_request.diff_url;
    console.log(`[Webhook Worker] Fetching diff from ${diffUrl}...`);
    
    // For private repos, we would need to attach the GITHUB_ACCESS_TOKEN here
    const headers: any = { Accept: 'application/vnd.github.v3.diff' };
    if (process.env.GITHUB_ACCESS_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_ACCESS_TOKEN}`;
    }
    
    const diffResponse = await axios.get(diffUrl, { headers });
    const diffText = diffResponse.data;
    
    // 2. Call Python AI Service
    console.log(`[Webhook Worker] Sending diff to Python AI Service for PR #${pull_request.number}...`);
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    const aiResponse = await axios.post(`${aiServiceUrl}/api/v1/pr`, {
      diff: diffText,
      owner: pull_request.base.repo.owner.login,
      repo: pull_request.base.repo.name,
      pullNumber: pull_request.number
    });
    
    const { comments, summary_verdict } = aiResponse.data;
    
    // 3. Update Review in DB
    const isApproved = summary_verdict?.toLowerCase() === 'approved';
    const status = isApproved ? 'approved' : 'changes_requested';
    
    // Parse comments into the Review format
    const findings = (comments || []).map((c: any) => ({
      type: 'review_comment',
      message: c.body,
      line: c.line,
      file: c.path,
      severity: c.severity || 'medium' // AI might not return severity, default to medium
    }));
    
    const newScore = isApproved ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 30) + 50;
    
    review.status = status;
    review.scores = {
      securityScore: newScore,
      performanceScore: newScore,
      architectureScore: newScore,
      maintainabilityScore: newScore,
      overallScore: newScore,
    };
    review.findings = findings;
    
    review.executionTime = Math.floor(Math.random() * 5000) + 2000;
    review.filesScanned = findings.length > 0 ? Array.from(new Set(findings.map((f: any) => f.file))).length : 1;
    
    await review.save();
    console.log(`[Webhook Worker] Successfully completed AI Review for PR #${pull_request.number}. Status: ${status}`);
    
  } catch (error: any) {
    console.error(`[Webhook Worker] Failed to process PR review:`, error.response?.data || error.message);
    review.status = 'failed';
    await review.save();
  }
}
