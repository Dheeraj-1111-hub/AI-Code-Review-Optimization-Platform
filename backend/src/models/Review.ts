import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  workspaceId?: mongoose.Types.ObjectId;
  repositoryId?: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  assignment?: {
    assignedBy: mongoose.Types.ObjectId;
    dueDate: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'assigned' | 'in_progress' | 'completed';
  };
  
  // Metadata
  title: string;
  branch: string;
  commitHash?: string;
  language: string;
  tags: string[];
  
  // PR Specific
  prNumber?: number;
  reviewType: 'workspace' | 'pull_request';
  
  // Versioning
  version: number;
  parentReviewId?: mongoose.Types.ObjectId;
  isArchived: boolean;
  
  // Execution Info
  executionTime?: number;
  filesScanned: number;
  
  // Input
  codeInput: string;
  files: any[];

  // Execution
  status: 'pending' | 'running' | 'analyzing' | 'completed' | 'approved' | 'changes_requested' | 'blocked' | 'failed' | 'merged' | 'closed' | 'needs_review' | 'critical';
  
  // Intelligence
  aiSummary?: string;
  scores: {
    securityScore: number;
    performanceScore: number;
    maintainabilityScore: number;
    architectureScore: number;
    overallScore: number;
  };
  
  // Results
  agentResults: any[];
  findings: any[];
  staticIssues: any[];
  patches: any[];
  
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace' },
    repositoryId: { type: Schema.Types.ObjectId, ref: 'Repository' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'TeamMember' },
    assignment: {
      assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      dueDate: { type: Date },
      severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
      status: { type: String, enum: ['assigned', 'in_progress', 'completed'], default: 'assigned' }
    },
    
    title: { type: String, required: true },
    branch: { type: String, default: 'main' },
    commitHash: { type: String },
    language: { type: String, required: true, default: 'typescript' },
    tags: [{ type: String }],
    
    prNumber: { type: Number },
    reviewType: { type: String, enum: ['workspace', 'pull_request'], default: 'workspace' },
    
    version: { type: Number, default: 1 },
    parentReviewId: { type: Schema.Types.ObjectId, ref: 'Review' },
    isArchived: { type: Boolean, default: false },
    
    executionTime: { type: Number },
    filesScanned: { type: Number, default: 0 },
    
    codeInput: { type: String },
    files: [{ type: Schema.Types.Mixed }],

    status: { 
      type: String, 
      enum: ['pending', 'running', 'analyzing', 'completed', 'approved', 'changes_requested', 'blocked', 'failed', 'merged', 'closed', 'needs_review', 'critical'], 
      default: 'pending' 
    },
    
    aiSummary: { type: String },
    scores: {
      securityScore: { type: Number, default: 0 },
      performanceScore: { type: Number, default: 0 },
      maintainabilityScore: { type: Number, default: 0 },
      architectureScore: { type: Number, default: 0 },
      overallScore: { type: Number, default: 0 }
    },
    
    agentResults: [{ type: Schema.Types.Mixed }],
    findings: [{ type: Schema.Types.Mixed }],
    staticIssues: [{ type: Schema.Types.Mixed }],
    patches: [{ type: Schema.Types.Mixed }]
  },
  { timestamps: true }
);

export default mongoose.model<IReview>('Review', ReviewSchema);
