import { useState, useEffect, useRef } from 'react';
import { useReviewDetail } from '../hooks/useReviews';
import { Loader2, ArrowLeft, Play, Download, Trash, FileCode, CheckCircle2, XCircle, AlertCircle, Clock, GitCommit } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import Editor from '@monaco-editor/react';
import { api } from '@/services/api/client';
import toast from 'react-hot-toast';

export function ReviewDetailView({ reviewId }: { reviewId: string }) {
  const { data: review, isLoading } = useReviewDetail(reviewId);
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isRerunning, setIsRerunning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const editorRef = useRef<any>(null);

  const files = review?.files && review.files.length > 0 ? review.files : [];

  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0]);
    }
  }, [files, selectedFile]);

  const updateDecorations = (editor: any, monaco: any) => {
    if (!selectedFile || !review?.findings) return;

    const decorations = review.findings
      .filter((f: any) => f.file === selectedFile.filename && f.line)
      .map((f: any) => {
        return {
          range: new monaco.Range(f.line, 1, f.line, 1),
          options: {
            isWholeLine: true,
            className: f.severity === 'critical' || f.severity === 'high' ? 'bg-red-500/20 border-l-2 border-red-500' : 'bg-yellow-500/20 border-l-2 border-yellow-500',
            hoverMessage: { value: `**[${(f.severity || 'WARNING').toUpperCase()}] ${f.title || 'Finding'}**\n\n${f.description || f.message}\n\n*${f.suggestion || ''}*` }
          }
        };
      });

    // Store the old decorations IDs to remove them on next update
    const oldDecorations = editorRef.current._customDecorations || [];
    editorRef.current._customDecorations = editor.deltaDecorations(oldDecorations, decorations);
  };

  useEffect(() => {
    if (editorRef.current) {
      const monaco = (window as any).monaco;
      if (monaco) {
        updateDecorations(editorRef.current, monaco);
      }
    }
  }, [selectedFile, review?.findings]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    (window as any).monaco = monaco;
    updateDecorations(editor, monaco);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-electric" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Review not found.
      </div>
    );
  }

  const handleRerun = async () => {
    try {
      setIsRerunning(true);
      toast.loading('Starting re-run...', { id: 'rerun' });
      const res: any = await api.post(`/v1/reviews/${review._id}/rerun`);
      toast.success('Re-run initialized!', { id: 'rerun' });
      if (res.reviewId) {
        navigate({ to: `/reviews/${res.reviewId}` });
      }
    } catch (e: any) {
      console.error('Failed to rerun', e);
      toast.error(e.message || 'Failed to re-run review', { id: 'rerun' });
    } finally {
      setIsRerunning(false);
    }
  };

  const handleExportPdf = () => {
    toast.success('Preparing PDF Document...', { duration: 2000 });
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleDelete = async () => {
    try {
      if (confirm('Are you sure you want to archive this review?')) {
        setIsDeleting(true);
        toast.loading('Archiving review...', { id: 'delete' });
        await api.delete(`/v1/reviews/${review._id}`);
        toast.success('Review archived', { id: 'delete' });
        navigate({ to: '/reviews' });
      }
    } catch (e: any) {
      console.error('Failed to delete', e);
      toast.error(e.message || 'Failed to archive review', { id: 'delete' });
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* 1. REVIEW HEADER */}
      <div className="flex-none border-b border-border/40 bg-surface/30 p-4">
        <div className="flex items-center justify-between mb-4">
          <Link to="/reviews" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Reviews
          </Link>
          <div className="flex gap-2 print:hidden">
            <button disabled={isRerunning} onClick={handleRerun} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-surface transition-colors disabled:opacity-50">
              {isRerunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />} 
              {isRerunning ? 'Initializing...' : 'Re-run Review'}
            </button>
            <button onClick={handleExportPdf} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-surface transition-colors">
              <Download className="h-3.5 w-3.5" /> Export PDF
            </button>
            <button disabled={isDeleting} onClick={handleDelete} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive text-xs font-medium hover:bg-destructive/10 transition-colors disabled:opacity-50">
              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash className="h-3.5 w-3.5" />} 
              {isDeleting ? 'Archiving...' : 'Archive'}
            </button>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground flex items-center gap-3">
              {review.title}
              <span className="text-sm font-mono text-muted-foreground bg-surface px-2 py-0.5 rounded">v{review.version}</span>
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {review.reviewType === 'pull_request' && <span className="flex items-center gap-1"><GitCommit className="h-4 w-4" /> {review.branch}</span>}
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {new Date(review.createdAt).toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-mono uppercase font-semibold ${
              review.status === 'approved' || review.status === 'merged' ? 'bg-success/15 text-success' :
              review.status === 'critical' ? 'bg-destructive/15 text-destructive' :
              review.status === 'changes_requested' ? 'bg-orange-500/15 text-orange-500' :
              review.status === 'needs_review' ? 'bg-yellow-500/15 text-yellow-500' :
              review.status === 'failed' ? 'bg-destructive/15 text-destructive' :
              review.status === 'blocked' ? 'bg-destructive/20 text-destructive' :
              review.status === 'running' || review.status === 'analyzing' ? 'bg-blue-500/15 text-blue-500 animate-pulse' :
              'bg-warning/15 text-warning'
            }`}>
              STATUS: {review.status.replace('_', ' ')}
            </div>
            {review.scores && (
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Overall Score</div>
                <div className="text-2xl font-mono font-bold text-electric glow-text">{review.scores.overallScore}/100</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* IDE LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 3. FILE EXPLORER */}
        <div className="w-64 flex-none border-r border-border/40 bg-surface/10 overflow-y-auto">
          <div className="p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40">
            Files Scanned ({files?.length || 0})
          </div>
          <div className="py-2">
            {files?.map((file: any, i: number) => (
              <button
                key={i}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-surface/50 transition-colors ${selectedFile === file ? 'bg-surface/50 text-electric border-l-2 border-electric' : 'text-muted-foreground'}`}
              >
                <FileCode className="h-4 w-4 flex-none" />
                <span className="truncate">{file.filename}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. CODE VIEWER */}
        <div className="flex-1 border-r border-border/40 bg-[#1e1e1e] flex flex-col relative">
          <div className="h-10 border-b border-white/10 bg-[#252526] flex items-center px-4 text-sm text-gray-300 font-mono">
            {selectedFile ? selectedFile.filename : 'Select a file to view'}
          </div>
          <div className="flex-1 relative">
            {!selectedFile ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                No file selected
              </div>
            ) : (
              <Editor
                height="100%"
                language={selectedFile.filename.endsWith('.ts') || selectedFile.filename.endsWith('.tsx') ? 'typescript' : 'javascript'}
                theme="vs-dark"
                value={selectedFile.patch || review.codeInput || 'No content'}
                onMount={handleEditorDidMount}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  padding: { top: 16 }
                }}
              />
            )}
          </div>
        </div>

        {/* 5. FINDINGS PANEL */}
        <div className="w-96 flex-none bg-surface/10 overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-border/40">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-warning" />
              Intelligence Findings
            </h3>
          </div>
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {review.findings?.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                No critical findings detected.
              </div>
            ) : (
              review.findings?.map((finding: any, i: number) => (
                <div key={i} className="p-4 rounded-lg bg-surface border border-border/50 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${
                      finding.severity === 'critical' ? 'bg-destructive/20 text-destructive' :
                      finding.severity === 'high' ? 'bg-orange-500/20 text-orange-500' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {finding.severity || 'warning'}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground border border-border/50 px-1.5 py-0.5 rounded">
                      {finding.agent || finding.type || 'Security AI'}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {finding.title || "Potential Flaw Detected"}
                    </p>
                    <p className="text-sm mt-1 text-muted-foreground leading-relaxed">
                      {finding.description || finding.message}
                    </p>
                  </div>
                  
                  {finding.file && (
                    <div className="text-xs font-mono text-muted-foreground bg-background/50 px-2 py-1.5 rounded border border-border/30">
                      {finding.file} {finding.line ? `:${finding.line}` : ''}
                    </div>
                  )}

                  {finding.affectedCode && (
                    <div className="mt-2 text-xs font-mono text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20 whitespace-pre-wrap">
                      <div className="text-[10px] uppercase opacity-70 mb-1">Issue</div>
                      {finding.affectedCode}
                    </div>
                  )}
                  
                  {finding.suggestion && (
                    <div className="mt-2 text-xs font-mono text-success bg-success/10 p-2 rounded border border-success/20 whitespace-pre-wrap">
                      <div className="text-[10px] uppercase opacity-70 mb-1">Suggested Fix</div>
                      {finding.suggestion}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
