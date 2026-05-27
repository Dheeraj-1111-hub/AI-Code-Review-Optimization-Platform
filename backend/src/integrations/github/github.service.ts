import { Octokit } from '@octokit/rest';
import { Repository } from '../../models/Repository';

export class GitHubService {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async fetchUserRepositories(workspaceId: string, limit: number = 50) {
    try {
      // Fetch repositories the authenticated user has access to
      const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
        per_page: limit,
        sort: 'updated',
        direction: 'desc'
      });

      return data.map(repo => ({
        githubId: repo.id.toString(),
        name: repo.full_name,
        defaultBranch: repo.default_branch,
        visibility: repo.private ? 'private' : 'public',
        language: repo.language
      }));
    } catch (error) {
      console.error('Error fetching GitHub repos:', error);
      throw new Error('Failed to fetch repositories from GitHub');
    }
  }

  async getFileTree(owner: string, repo: string, branch: string) {
    try {
      const { data } = await this.octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: branch,
        recursive: 'true'
      });
      return data.tree;
    } catch (error) {
      console.error(`Error fetching tree for ${owner}/${repo}:`, error);
      throw new Error('Failed to fetch repository file tree');
    }
  }

  async getPullRequestDiff(owner: string, repo: string, pullNumber: number) {
    try {
      const { data } = await this.octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
        mediaType: {
          format: 'diff'
        }
      });
      return data; // Returns the raw diff string
    } catch (error) {
      console.error(`Error fetching PR diff for ${owner}/${repo}#${pullNumber}:`, error);
      throw new Error('Failed to fetch PR diff');
    }
  }
}
