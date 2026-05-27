import parseDiff from 'parse-diff';
import Review, { IReview } from '../models/Review';
import mongoose from 'mongoose';

export const importManualDiff = async (
  userId: string,
  title: string, 
  branch: string, 
  rawDiff: string
): Promise<IReview> => {
  const parsed = parseDiff(rawDiff);

  const files = parsed.map(file => {
    // Generate the patch string for just this file
    const filePatch = file.chunks.map(chunk => {
      let chunkStr = chunk.content + '\n';
      chunk.changes.forEach(change => {
        chunkStr += change.content + '\n';
      });
      return chunkStr;
    }).join('\n');

    let status = 'modified';
    if (file.new) status = 'added';
    if (file.deleted) status = 'removed';

    return {
      filename: file.to || file.from || 'unknown',
      status,
      additions: file.additions,
      deletions: file.deletions,
      patch: filePatch
    };
  });

  const review = new Review({
    userId,
    title,
    branch,
    reviewType: 'pull_request',
    status: 'analyzing', // PR status starts at analyzing
    language: 'mixed', // Diff can contain multiple languages
    codeInput: rawDiff, // We save the raw diff as codeInput just in case
    files,
    filesScanned: files.length,
    agentResults: [],
    findings: [],
    staticIssues: [],
    patches: []
  });

  await review.save();
  return review;
};
