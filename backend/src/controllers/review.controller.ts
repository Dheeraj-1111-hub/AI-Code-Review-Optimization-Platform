import { Request, Response } from 'express';
import Review from '../models/Review';
import { Repository } from '../models/Repository';
import ReviewTimeline from '../models/ReviewTimeline';
import axios from 'axios';
import { getIo } from '../config/socket';
import { getReviewsWithFilters } from '../services/review-query.service';
import { AuditLog } from '../models/AuditLog';
import { ScannerService } from '../services/scanner.service';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const startReview = async (req: Request, res: Response) => {
  try {
    const { code, language, repositoryId, title, branch, commitHash } = req.body;
    
    // We assume the user is injected by the protect middleware
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Generate dynamic metadata if not provided
    const reviewTitle = title || `Review-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const reviewBranch = branch || 'main';

    // 1. Create a Pending Review in Database
    const review = await Review.create({
      userId: user._id,
      repositoryId: repositoryId || null,
      title: reviewTitle,
      branch: reviewBranch,
      commitHash: commitHash || null,
      codeInput: code,
      language: language || 'python',
      status: 'analyzing'
    });

    // 1b. Create Timeline Event
    await ReviewTimeline.create({
      reviewId: review._id,
      eventType: 'analysis_started',
      message: 'AI Engineering Engine initialized.',
      metadata: { language, repositoryId }
    });

    // We respond to the HTTP request immediately so the frontend knows it started.
    res.status(202).json({ 
      message: 'Review analysis started', 
      reviewId: review._id 
    });

    // 2. Start streaming from Python AI Service in the background
    // We use a specific socket room for this user or review ID to stream chunks
    const io = getIo();
    const streamRoom = `review_${review._id}`;
    
    try {
      const response = await axios({
        method: 'post',
        url: `${AI_SERVICE_URL}/api/v1/analyze/stream`,
        data: { code, language: language || 'python' },
        responseType: 'stream'
      });

      response.data.on('data', async (chunk: Buffer) => {
        const str = chunk.toString();
        // SSE format is "data: {...}\n\n"
        if (str.startsWith('data: ')) {
          try {
            const jsonData = JSON.parse(str.replace('data: ', '').trim());
            
            // Forward chunk to the frontend via Socket.io
            io.to(streamRoom).emit('review-chunk', jsonData);
            
            // If it's complete, save the final results to MongoDB
            if (jsonData.type === 'complete') {
              const finalResult = jsonData.result;
              await Review.findByIdAndUpdate(review._id, {
                status: 'completed',
                aiSummary: finalResult.aiSummary || 'Analysis completed successfully across all agents.',
                scores: {
                  securityScore: finalResult.securityScore,
                  performanceScore: finalResult.performanceScore,
                  maintainabilityScore: finalResult.maintainabilityScore,
                  architectureScore: finalResult.architectureScore,
                  overallScore: finalResult.overallScore
                },
                agentResults: finalResult.agentResults,
                staticIssues: finalResult.staticIssues,
                findings: finalResult.agentResults.flatMap((a: any) => a.issues || [])
              });

              if (review.repositoryId) {
                // Phase 4: Sync Intelligence Metrics to Repository
                await Repository.findByIdAndUpdate(review.repositoryId, {
                  healthScore: finalResult.overallScore || 100,
                  metrics: {
                    security: finalResult.securityScore || 100,
                    performance: finalResult.performanceScore || 100,
                    maintainability: finalResult.maintainabilityScore || 100,
                    architecture: finalResult.architectureScore || 100
                  },
                  latestReviewId: review._id
                });
              }

              await ReviewTimeline.create({
                reviewId: review._id,
                eventType: 'review_completed',
                message: 'Analysis complete. Security and architecture checks passed.',
                metadata: { overallScore: finalResult.overallScore }
              });

              if (review.workspaceId) {
                await AuditLog.create({
                  workspaceId: review.workspaceId,
                  actorId: user.clerkId,
                  action: 'review_completed',
                  entity: 'review',
                  metadata: { reviewId: review._id, reviewTitle: review.title }
                });
                
                // Notify the dashboard to re-fetch real-time aggregations
                io.emit('dashboard:update', { workspaceId: review.workspaceId });
              }
            }
          } catch (e) {
            // Ignore parse errors from partial chunks
          }
        }
      });

      response.data.on('end', () => {
        io.to(streamRoom).emit('review-complete', { reviewId: review._id });
      });

    } catch (aiError) {
      console.error('AI Service Error:', aiError);
      await Review.findByIdAndUpdate(review._id, { status: 'failed' });
      
      await ReviewTimeline.create({
        reviewId: review._id,
        eventType: 'review_failed',
        message: 'AI Service failed to analyze code.',
      });

      io.to(streamRoom).emit('review-error', { message: 'AI Service failed to analyze code.' });
    }

  } catch (error) {
    console.error('Start review error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findById(req.params.id).lean();
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Also fetch timeline
    const timeline = await ReviewTimeline.find({ reviewId: review._id }).sort({ createdAt: 1 }).lean();
    
    res.json({ ...review, timeline });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyReviews = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { page, limit, status, language, search } = req.query;
    
    const result = await getReviewsWithFilters({
      userId: user._id.toString(),
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      status: status as string,
      language: language as string,
      search: search as string
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user?._id });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    review.isArchived = true;
    await review.save();
    
    res.json({ success: true, message: 'Review archived' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const rerunReview = async (req: Request, res: Response) => {
  try {
    const oldReview = await Review.findOne({ _id: req.params.id, userId: req.user?._id });
    if (!oldReview) return res.status(404).json({ message: 'Review not found' });

    // Create a new version
    const newReview = await Review.create({
      userId: oldReview.userId,
      repositoryId: oldReview.repositoryId,
      title: `${oldReview.title} (Re-run)`,
      branch: oldReview.branch,
      commitHash: oldReview.commitHash,
      codeInput: oldReview.codeInput,
      language: oldReview.language,
      files: oldReview.files,
      filesScanned: oldReview.filesScanned,
      reviewType: oldReview.reviewType,
      prNumber: oldReview.prNumber,
      status: 'analyzing',
      version: oldReview.version + 1,
      parentReviewId: oldReview._id
    });

    await ReviewTimeline.create({
      reviewId: newReview._id,
      eventType: 'analysis_started',
      message: `AI Engineering Engine re-run initialized (v${newReview.version}).`,
    });

    res.status(202).json({ 
      success: true,
      message: 'Review re-run started', 
      reviewId: newReview._id 
    });

    // Trigger Python service depending on reviewType
    const io = getIo();
    const streamRoom = `review_${newReview._id}`;

    if (newReview.repositoryId && newReview.reviewType !== 'pull_request') {
      const repository = await Repository.findById(newReview.repositoryId);
      if (repository) {
        let cloneUrl = repository.cloneUrl || `https://github.com/${repository.fullName}.git`;
        if (repository.isPrivate && process.env.GITHUB_ACCESS_TOKEN) {
          cloneUrl = `https://${process.env.GITHUB_ACCESS_TOKEN}@github.com/${repository.fullName}.git`;
        }
        ScannerService.runFullScan(newReview._id.toString(), repository._id.toString(), cloneUrl);
      }
    } else if (newReview.reviewType === 'pull_request') {
      axios.post(`${AI_SERVICE_URL}/api/v1/pr/simulate`, {
        prId: newReview._id.toString(),
        files: newReview.files
      }).catch(console.error);
    } else {
      try {
        const response = await axios({
          method: 'post',
          url: `${AI_SERVICE_URL}/api/v1/analyze/stream`,
          data: { code: newReview.codeInput, language: newReview.language },
          responseType: 'stream'
        });

        response.data.on('data', async (chunk: Buffer) => {
          const str = chunk.toString();
          if (str.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(str.replace('data: ', '').trim());
              io.to(streamRoom).emit('review-chunk', jsonData);
              
              if (jsonData.type === 'complete') {
                const finalResult = jsonData.result;
                await Review.findByIdAndUpdate(newReview._id, {
                  status: 'completed',
                  aiSummary: finalResult.aiSummary || 'Analysis completed.',
                  scores: {
                    securityScore: finalResult.securityScore,
                    performanceScore: finalResult.performanceScore,
                    maintainabilityScore: finalResult.maintainabilityScore,
                    architectureScore: finalResult.architectureScore,
                    overallScore: finalResult.overallScore
                  },
                  agentResults: finalResult.agentResults,
                  staticIssues: finalResult.staticIssues,
                  findings: finalResult.agentResults.flatMap((a: any) => a.issues || [])
                });

                await ReviewTimeline.create({
                  reviewId: newReview._id,
                  eventType: 'review_completed',
                  message: 'Re-run analysis complete.',
                });

                if (oldReview.workspaceId) {
                  await AuditLog.create({
                    workspaceId: oldReview.workspaceId,
                    actorId: req.user?.clerkId || 'system',
                    action: 'review_completed',
                    entity: 'review',
                    metadata: { reviewId: newReview._id, reviewTitle: newReview.title }
                  });
                  
                  io.emit('dashboard:update', { workspaceId: oldReview.workspaceId });
                }
              }
            } catch (e) {}
          }
        });
        
        response.data.on('end', () => {
          io.to(streamRoom).emit('review-complete', { reviewId: newReview._id });
        });
      } catch (err) {
        console.error('Rerun Python Service Error', err);
        await Review.findByIdAndUpdate(newReview._id, { status: 'failed' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
