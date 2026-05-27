import { GitHubService } from '../../integrations/github/github.service';
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export class PRService {
  private github: GitHubService;

  constructor(token: string) {
    this.github = new GitHubService(token);
  }

  async analyzePullRequest(owner: string, repo: string, pullNumber: number, installationToken: string) {
    // 1. Fetch the raw diff from GitHub
    const diff = await this.github.getPullRequestDiff(owner, repo, pullNumber);
    
    // 2. Parse diff to identify changed files and chunks (simplified for now)
    console.log(`Analyzing PR #${pullNumber} diff`);
    
    // 3. Send diff to AI Service for incremental review and inline comments
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/v1/analyze/pr`, {
        diff,
        owner,
        repo,
        pullNumber
      });
      
      return response.data; // AI generated inline comments and verdicts
    } catch (error) {
      console.error('Failed to analyze PR with AI Engine:', error);
      throw new Error('AI Analysis of PR failed');
    }
  }
}
