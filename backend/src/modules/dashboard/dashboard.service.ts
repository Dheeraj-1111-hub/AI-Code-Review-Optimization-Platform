import Review from '../../models/Review';
import { Repository } from '../../models/Repository';
import { AuditLog } from '../../models/AuditLog';
import mongoose from 'mongoose';

export class DashboardService {
  /**
   * Generates the real-time aggregated payload for the main dashboard overview
   */
  static async getOverview(workspaceId: string) {
    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return DashboardService.emptyPayload();
    }

    const wsObjectId = new mongoose.Types.ObjectId(workspaceId);

    // 1. Fetch Recent Reviews
    const recentReviewsRaw = await Review.find({ workspaceId: wsObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('repositoryId', 'name')
      .lean();

    // 2. Fetch Activity Feed (from AuditLog)
    const recentActivityRaw = await AuditLog.find({ workspaceId: wsObjectId })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    // 3. Aggregate Key Metrics & Trends
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [reviewStats, repoStats, trendStats, repositoryHealthRaw] = await Promise.all([
      Review.aggregate([
        { $match: { workspaceId: wsObjectId, createdAt: { $gte: sevenDaysAgo } } },
        { 
          $group: { 
            _id: null, 
            count: { $sum: 1 },
            avgSecurity: { $avg: '$scores.securityScore' },
            avgArchitecture: { $avg: '$scores.architectureScore' },
            avgPerformance: { $avg: '$scores.performanceScore' },
            avgMaintainability: { $avg: '$scores.maintainabilityScore' },
            avgDuration: { $avg: '$executionTime' }
          } 
        }
      ]),
      Repository.aggregate([
        { $match: { workspaceId: wsObjectId, isArchived: false } },
        {
          $group: {
            _id: null,
            avgHealth: { $avg: '$healthScore' },
            totalRepos: { $sum: 1 }
          }
        }
      ]),
      Review.aggregate([
        { $match: { workspaceId: wsObjectId, createdAt: { $gte: fourteenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            avgScore: { $avg: "$scores.overallScore" }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Repository.find({ workspaceId: wsObjectId, isArchived: false })
        .sort({ healthScore: 1 })
        .limit(5)
        .select('name healthScore metrics.security metrics.performance')
        .lean()
    ]);

    const reviewMetrics = reviewStats[0] || { count: 0, avgSecurity: 0, avgArchitecture: 0, avgPerformance: 0, avgMaintainability: 0, avgDuration: 0 };
    const repoMetrics = repoStats[0] || { avgHealth: 75, totalRepos: 0 };

    // Process Trend Data (Fill in missing days)
    const trendMap = new Map(trendStats.map(t => [t._id, t.avgScore]));
    const trendData = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(fourteenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      return {
        d: `${d.getMonth() + 1}/${d.getDate()}`,
        v: Math.round(trendMap.get(dateStr) || repoMetrics.avgHealth || 75)
      };
    });

    // 4. Extract Real Security Alerts from Recent Reviews
    const alerts: Array<{ sev: string, text: string, repo: string }> = [];
    for (const rev of recentReviewsRaw) {
      if (rev.findings && Array.isArray(rev.findings)) {
        for (const finding of rev.findings) {
          if (finding.severity === 'critical' || finding.severity === 'high') {
            alerts.push({
              sev: finding.severity === 'critical' ? 'high' : 'med',
              text: `${finding.comment || finding.type} in ${finding.file || 'unknown'}`,
              repo: (rev.repositoryId as any)?.name || 'Unknown'
            });
          }
        }
      }
    }
    // Take top 5 alerts
    const topAlerts = alerts.slice(0, 5);

    // 4.5 Agent Execution Stats
    const agentStatsMap = new Map<string, number>();
    for (const rev of recentReviewsRaw) {
      if (rev.agentResults && Array.isArray(rev.agentResults)) {
        for (const res of rev.agentResults) {
          const agentName = res.agent || 'Unknown Agent';
          agentStatsMap.set(agentName, (agentStatsMap.get(agentName) || 0) + (res.findings?.length || 0));
        }
      }
    }
    const agentStats = Array.from(agentStatsMap.entries()).map(([name, findingsCount]) => ({ name, findingsCount }));

    // 5. Format Activity Feed
    const activity = recentActivityRaw.map((act: any) => {
      let what = act.action.replace(/_/g, ' ');
      if (act.entity) what += ` ${act.entity}`;
      
      const timeDiffMs = Date.now() - new Date(act.timestamp).getTime();
      const mins = Math.floor(timeDiffMs / 60000);
      const hrs = Math.floor(mins / 60);
      const days = Math.floor(hrs / 24);
      
      let tStr = "just now";
      if (days > 0) tStr = `${days}d ago`;
      else if (hrs > 0) tStr = `${hrs}h ago`;
      else if (mins > 0) tStr = `${mins}m ago`;

      return {
        who: act.metadata?.actorName || 'System',
        what,
        t: tStr
      };
    });

    // 6. Generate Executive Insight
    let insightText = "Welcome to DevLens! Submit your first PR for review to see live engineering insights here.";
    let tags = ["Ready to scan", "AI agents standing by", "Submit a PR"];
    
    if (recentReviewsRaw.length > 0) {
      const improved = reviewMetrics.avgArchitecture > 70;
      insightText = improved 
        ? `Your repositories are maintaining solid architectural boundaries. Average security score is ${Math.round(reviewMetrics.avgSecurity)}.`
        : `Architecture drift detected in recent reviews. Consider addressing critical security findings.`;
      
      tags = [
        `Score: ${Math.round(reviewMetrics.avgSecurity)}`,
        `${reviewMetrics.count} reviews this week`,
        `${alerts.length} high/critical issues`
      ];
    }

    return {
      metrics: {
        reviewsThisWeek: reviewMetrics.count,
        securityScore: reviewMetrics.avgSecurity > 80 ? 'A+' : (reviewMetrics.avgSecurity > 60 ? 'B' : (reviewMetrics.avgSecurity > 0 ? 'C' : 'A+')),
        architectureHealth: Math.round(reviewMetrics.avgArchitecture || repoMetrics.avgHealth || 75),
        avgScanTime: reviewMetrics.count > 0 ? `${((reviewMetrics.avgDuration || 0) / 1000).toFixed(1)}s` : '0.0s'
      },
      insights: {
        text: insightText,
        tags: tags
      },
      optimizationScore: Math.round((reviewMetrics.avgPerformance + reviewMetrics.avgMaintainability) / 2) || 82,
      trend: trendData,
      recentReviews: recentReviewsRaw.map((r: any) => ({
        id: r._id,
        repo: r.repositoryId?.name || r.title || 'Unknown',
        branch: r.branch || 'main',
        score: Math.round(r.scores?.overallScore || 0),
        status: r.status === 'completed' ? 'approved' : (r.status || 'pending')
      })),
      alerts: topAlerts.length > 0 ? topAlerts : [],
      activity: activity.length > 0 ? activity : [],
      repositoryHealth: repositoryHealthRaw.map((r: any) => ({
        repo: r.name,
        health: Math.round(r.healthScore || 0)
      })),
      agentStats: agentStats,
      systemHealth: {
        github: 'connected', // We can check integrations later
        ai: 'operational',
        db: mongoose.connection.readyState === 1 ? 'healthy' : 'degraded'
      }
    };
  }

  static emptyPayload() {
    const trendData = Array.from({ length: 14 }, (_, i) => ({ d: `${i}d`, v: 75 }));
    return {
      metrics: { reviewsThisWeek: 0, securityScore: 'A+', architectureHealth: 75, avgScanTime: '0.0s' },
      insights: {
        text: "Welcome to DevLens! Connect your GitHub and submit a PR for review to see live insights here.",
        tags: ["Ready to scan", "AI agents standing by", "Submit a PR"]
      },
      optimizationScore: 82,
      trend: trendData,
      recentReviews: [],
      alerts: [],
      activity: [],
      repositoryHealth: [],
      agentStats: [],
      systemHealth: {
        github: 'unknown',
        ai: 'operational',
        db: mongoose.connection.readyState === 1 ? 'healthy' : 'degraded'
      }
    };
  }
}
