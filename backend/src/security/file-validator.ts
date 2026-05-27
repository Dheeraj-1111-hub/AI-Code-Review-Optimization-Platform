import path from 'path';

export class FileValidator {
  /**
   * Prevents malicious file uploads, binary blobs, and massive files
   * from crashing the AI parsers or executing arbitrary code.
   */
  
  static readonly DANGEROUS_EXTENSIONS = ['.exe', '.dll', '.so', '.sh', '.bat', '.cmd', '.bin', '.pdf', '.zip', '.tar', '.gz'];
  static readonly MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit per file

  static isSafe(filename: string, fileSize: number): { safe: boolean; reason?: string } {
    const ext = path.extname(filename).toLowerCase();

    // 1. Check Extension
    if (this.DANGEROUS_EXTENSIONS.includes(ext)) {
      return { safe: false, reason: `File type ${ext} is blocked for security reasons.` };
    }

    // 2. Check Size
    if (fileSize > this.MAX_FILE_SIZE_BYTES) {
      return { safe: false, reason: `File exceeds the maximum allowed size of 5MB.` };
    }

    // 3. Prevent Directory Traversal / Hidden Files
    if (filename.includes('../') || filename.startsWith('.env')) {
      return { safe: false, reason: `Suspicious file path detected.` };
    }

    return { safe: true };
  }
}
