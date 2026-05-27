import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export class DependencyAuditService {
  /**
   * Executes 'npm audit' against a downloaded repository path to detect 
   * critical/high vulnerability dependencies.
   */
  static async scanNpmDependencies(repoPath: string): Promise<any> {
    try {
      // Execute npm audit, requesting JSON format
      // Note: npm audit exits with code 1 if vulnerabilities are found, so we catch it
      const { stdout } = await execAsync('npm audit --json', { cwd: repoPath }).catch(e => e);
      
      const report = JSON.parse(stdout);
      
      return {
        vulnerable: report.metadata.vulnerabilities.total > 0,
        summary: report.metadata.vulnerabilities,
        details: report.vulnerabilities // Object containing specific CVEs
      };
    } catch (error) {
      console.error(`Dependency scan failed for ${repoPath}:`, error);
      return { error: 'Failed to scan dependencies' };
    }
  }
}
