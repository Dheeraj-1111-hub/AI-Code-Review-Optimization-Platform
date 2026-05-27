import { RepositoryMetrics } from '../../models/RepositoryMetrics';
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export class ScoreProcessor {
  /**
   * Triggers the Python AI Service to calculate overall repository health,
   * technical debt, and architecture complexity for a given repository.
   */
  static async calculateRepositoryHealth(repositoryId: string, repoUrl: string) {
    try {
      console.log(`[ScoreProcessor] Calculating health for repo ${repositoryId}`);
      
      // Request AI Service to analyze the full repository tree/snapshots
      const response = await axios.post(`${AI_SERVICE_URL}/api/v1/analytics/health`, {
        repoId: repositoryId,
        repoUrl: repoUrl
      });

      const {
        healthScore,
        technicalDebt,
        architectureComplexity,
        vulnerabilityCount,
        performanceTrend,
        maintainabilityTrend
      } = response.data;

      // Update or create metrics snapshot
      await RepositoryMetrics.create({
        repositoryId,
        healthScore,
        technicalDebt,
        architectureComplexity,
        vulnerabilityCount,
        performanceTrend,
        maintainabilityTrend,
        aiConfidenceScore: 92 // Example static confidence or returned by AI
      });

      console.log(`[ScoreProcessor] Successfully generated metrics for ${repositoryId}`);
    } catch (error) {
      console.error(`[ScoreProcessor] Failed to calculate health for ${repositoryId}:`, error);
      throw error;
    }
  }
}
