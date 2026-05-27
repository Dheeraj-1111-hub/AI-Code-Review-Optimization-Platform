import mongoose from 'mongoose';
import Review from '../models/Review';
import { Repository } from '../models/Repository';
import ReviewTimeline from '../models/ReviewTimeline';

export const getLiveAnalytics = async (workspaceId?: string) => {
  const query = workspaceId ? { workspaceId } : {};

  // 1. Fetch data
  const repositories = await Repository.find(query).lean();
  
  // Last 30 days reviews for trend/overview
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const reviews = await Review.find({ 
    ...query, 
    status: { $nin: ['pending', 'running', 'analyzing', 'failed'] }, 
    createdAt: { $gte: thirtyDaysAgo } 
  })
    .select('findings scores executionTime filesScanned createdAt reviewType title status')
    .sort({ createdAt: -1 })
    .lean();
    
  const timelines = await ReviewTimeline.find({ ...query })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('reviewId', 'title')
    .lean();

  // 2. Compute KPI Overview
  const repositoriesScanned = repositories.length;
  const prsReviewed = reviews.filter(r => r.reviewType === 'pull_request').length;
  
  let totalCritical = 0;
  let totalExecutionTime = 0;
  let validExecutionCount = 0;
  
  const issueCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {
    'Security': 0,
    'Performance': 0,
    'Architecture': 0,
    'Code Quality': 0,
    'Testing': 0
  };

  reviews.forEach(r => {
    if (r.executionTime) {
      totalExecutionTime += r.executionTime;
      validExecutionCount++;
    }

    if (r.findings && Array.isArray(r.findings)) {
      r.findings.forEach((f: any) => {
        if (f.severity === 'critical') totalCritical++;
        
        // Track top issues
        const issueKey = f.title || f.message || 'Unknown Issue';
        issueCounts[issueKey] = (issueCounts[issueKey] || 0) + 1;
        

        // Track categories (fuzzy matching based on agent/type or finding text content)
        const type = (f.type || '').toLowerCase();
        const agent = (f.agent || '').toLowerCase();
        const text = `${f.title || ''} ${f.message || ''} ${f.comment || ''} ${f.suggestion || ''}`.toLowerCase();
        
        if (type.includes('secur') || agent.includes('secur') || f.severity === 'critical' || text.match(/security|vulnerab|auth|inject|xss|cors|leak|exposure|unsafe|exploit/)) {
          categoryCounts['Security']++;
        } else if (type.includes('perf') || agent.includes('perf') || text.match(/performance|slow|memory|leak|optimiz|cache|render|efficient|bottleneck/)) {
          categoryCounts['Performance']++;
        } else if (type.includes('arch') || agent.includes('arch') || text.match(/pattern|architect|component|refactor|abstract|structure|decouple|dependency|solid/)) {
          categoryCounts['Architecture']++;
        } else if (type.includes('test') || agent.includes('test') || text.match(/test|coverage|mock|assert|fixture|spec|jest|cypress/)) {
          categoryCounts['Testing']++;
        } else {
          categoryCounts['Code Quality']++;
        }
      });
    }
  });

  const avgReviewTimeMs = validExecutionCount > 0 ? Math.floor(totalExecutionTime / validExecutionCount) : 0;
  
  // Format execution time
  const avgReviewTime = avgReviewTimeMs > 60000 
    ? `${Math.floor(avgReviewTimeMs / 60000)}m ${Math.floor((avgReviewTimeMs % 60000) / 1000)}s`
    : `${Math.floor(avgReviewTimeMs / 1000)}s`;

  const topIssuesRaw = Object.entries(issueCounts).sort((a, b) => b[1] - a[1]);
  const mostCommonIssue = topIssuesRaw.length > 0 ? topIssuesRaw[0][0] : "None detected";
  
  const topIssues = topIssuesRaw.slice(0, 5).map(([issue, count]) => ({ issue, count }));

  const findingsByCategory = Object.entries(categoryCounts)
    .filter(([_, count]) => count > 0)
    .map(([category, count]) => ({ category, count }));

  // 3. Repository Health
  const repositoryHealth = repositories.map(repo => {
    return {
      name: repo.name,
      score: repo.healthScore || 100,
      critical: repo.metrics?.security && repo.metrics.security < 50 ? 2 : 0, // Fallback proxy
      lastScan: repo.lastScannedAt,
      trend: repo.healthScore && repo.healthScore > 80 ? 'up' : 'down'
    };
  }).sort((a, b) => a.score - b.score); // Lowest score first

  // 4. Recent Events
  const recentEvents = timelines.map(t => {
    return {
      message: t.message,
      date: t.createdAt,
      type: t.eventType,
      reviewTitle: (t.reviewId as any)?.title || 'Scan'
    };
  });

  // 5. Generate True Historical Data
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const historyMap: Record<string, { totalScore: number, count: number }> = {};
  
  // Initialize the last 14 days with 0 counts
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    historyMap[dateStr] = { totalScore: 0, count: 0 };
  }

  // Populate actual data
  reviews.forEach(r => {
    if (new Date(r.createdAt) >= fourteenDaysAgo) {
      const dateStr = new Date(r.createdAt).toISOString().split('T')[0];
      if (historyMap[dateStr]) {
        // Calculate organic score: 100 minus (10 per critical issue, 5 per high, 2 per medium)
        let organicScore = 100;
        if (r.scores?.overallScore && r.scores.overallScore > 0) {
          organicScore = r.scores.overallScore;
        } else if (r.findings && r.findings.length > 0) {
          let deduction = 0;
          r.findings.forEach((f: any) => {
            if (f.severity === 'critical') deduction += 10;
            else if (f.severity === 'high') deduction += 5;
            else if (f.severity === 'medium') deduction += 2;
          });
          organicScore = Math.max(0, 100 - deduction);
        }
        
        historyMap[dateStr].totalScore += organicScore;
        historyMap[dateStr].count += 1;
      }
    }
  });

  const history = Object.entries(historyMap).map(([dateStr, data]) => ({
    generatedAt: dateStr,
    qualityScore: data.count > 0 ? Math.round(data.totalScore / data.count) : null
  }));

  // Forward fill missing data points so the chart is continuous
  let lastKnownScore = 100;
  history.forEach(day => {
    if (day.qualityScore === null) {
      day.qualityScore = lastKnownScore;
    } else {
      lastKnownScore = day.qualityScore;
    }
  });

  // Calculate True Quality Trend: 
  // Compare avg score of last 7 days vs previous 7 days
  let current7Score = 0; let current7Count = 0;
  let previous7Score = 0; let previous7Count = 0;

  history.forEach((day, idx) => {
    if (idx >= 7) {
      current7Score += (day.qualityScore || 0);
      current7Count++;
    } else {
      previous7Score += (day.qualityScore || 0);
      previous7Count++;
    }
  });

  const avgCurrent = current7Count > 0 ? current7Score / current7Count : 100;
  const avgPrev = previous7Count > 0 ? previous7Score / previous7Count : 100;
  const qualityTrend = Math.round(avgCurrent - avgPrev);

  // 6. Return Data
  return {
    overview: {
      repositoriesScanned,
      prsReviewed,
      criticalIssues: totalCritical,
      avgReviewTime,
      mostCommonIssue,
      qualityTrend
    },
    findingsByCategory,
    repositoryHealth,
    topIssues,
    recentEvents,
    history
  };
};

export const generateAnalyticsSnapshot = async (workspaceId?: string) => {
  // Backwards compatibility for the controller
  return getLiveAnalytics(workspaceId);
};
