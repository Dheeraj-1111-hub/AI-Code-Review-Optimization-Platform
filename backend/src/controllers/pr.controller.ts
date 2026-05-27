import { Request, Response } from 'express';
import { importManualDiff } from '../services/pr.service';
import { Workspace } from '../models/Workspace';
import axios from 'axios';
import { getIo } from '../config/socket';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const startPRSimulation = async (req: Request, res: Response) => {
  try {
    const { title, branch, rawDiff } = req.body;
    
    // 1. Ingest PR Diff
    const review = await importManualDiff(
      req.user?._id?.toString() || 'anonymous',
      title || 'Untitled PR',
      branch || 'main',
      rawDiff
    );

    // Fetch the user's workspace to retrieve AI Config preferences
    const clerkId = req.user?.clerkId;
    let aiConfig = {};
    if (clerkId) {
      const workspace = await Workspace.findOne({ ownerId: clerkId });
      if (workspace && workspace.aiConfig) {
        aiConfig = workspace.aiConfig;
      }
    }

    // 2. Start Python Orchestrator in background
    // We send it to a special /api/v1/pr/simulate endpoint in Python
    axios.post(`${AI_SERVICE_URL}/api/v1/pr/simulate`, {
      prId: review._id.toString(),
      files: review.files,
      aiConfig: aiConfig
    }).catch(e => {
      console.error('Failed to trigger Python PR simulation:', e);
    });

    // 3. Return the Review document immediately
    res.status(202).json({
      success: true,
      message: 'PR imported and simulation started.',
      prId: review._id
    });
    
  } catch (error) {
    console.error('Failed to start PR simulation:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPR = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { default: Review } = await import('../models/Review');
    
    const pr = await Review.findById(id).lean();
    if (!pr) return res.status(404).json({ message: 'PR not found' });
    
    // For backwards compatibility with the frontend that expects `reviews`
    res.json({ ...pr, reviews: pr.agentResults });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const prWebhook = async (req: Request, res: Response) => {
  try {
    const { prId, agent_reviews } = req.body;
    
    const { default: Review } = await import('../models/Review');
    const { default: ReviewTimeline } = await import('../models/ReviewTimeline');

    const pr = await Review.findById(prId);
    if (!pr) return res.status(404).json({ message: 'PR not found' });

    // Determine overall status based on agent verdicts
    let hasBlock = false;
    let hasChanges = false;
    
    // We store the agent reviews directly in the agentResults array
    pr.agentResults = agent_reviews.map((r: any) => ({
      agent: r.agent,
      verdict: r.verdict,
      summary: r.summary,
      reasoning: r.reasoning,
      findings: r.findings || [],
      model_used: r.model_used
    }));
    
    // Flatten findings
    pr.findings = pr.agentResults.flatMap(r => r.findings);

    for (const review of pr.agentResults) {
      if (review.verdict === 'BLOCK') hasBlock = true;
      if (review.verdict === 'REQUEST_CHANGES') hasChanges = true;
    }

    if (hasBlock) pr.status = 'blocked';
    else if (hasChanges) pr.status = 'changes_requested';
    else pr.status = 'completed'; // For PRs, completed means AI is done.

    await pr.save();
    
    await ReviewTimeline.create({
      reviewId: pr._id,
      eventType: 'review_completed',
      message: `Multi-agent PR simulation complete. Final status: ${pr.status}`,
    });

    // Emit Socket Event
    const io = getIo();
    if (io) {
      io.emit('pr:status-updated', { prId, status: pr.status });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ success: false });
  }
};

export const updatePRStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['draft', 'reviewing', 'changes_requested', 'approved', 'blocked', 'merged', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const { default: Review } = await import('../models/Review');

    const pr = await Review.findById(id);
    if (!pr) return res.status(404).json({ message: 'PR not found' });

    // Strict validation for 'merged' state
    if (status === 'merged') {
      const blockers = pr.agentResults.filter(r => r.verdict === 'BLOCK');
      
      if (blockers.length > 0) {
        const blockingAgents = blockers.map(b => b.agent).join(', ');
        return res.status(400).json({ 
          success: false, 
          message: `Cannot merge: Blocking reviews exist from ${blockingAgents}.` 
        });
      }
    }

    pr.status = status;
    await pr.save();

    res.json({ success: true, pr });
  } catch (error) {
    console.error('Update PR Status Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
