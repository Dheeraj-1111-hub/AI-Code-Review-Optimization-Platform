import React from 'react';
import { GitMerge } from 'lucide-react';

interface DiffViewerProps {
  files: {
    filename: string;
    additions: number;
    deletions: number;
    patch: string;
  }[];
}

export function DiffViewer({ files }: DiffViewerProps) {
  if (!files || files.length === 0) return <div className="p-4 text-muted-foreground">No diff data available.</div>;

  return (
    <div className="flex flex-col gap-6">
      {files.map((file, fileIdx) => {
        // Simple manual parsing of the git patch format for display
        const lines = file.patch.split('\n');

        return (
          <div key={fileIdx} className="gradient-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitMerge className="h-4 w-4 text-electric" />
                <span className="font-mono text-xs">{file.filename}</span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">
                <span className="text-success">+{file.additions}</span>{' '}
                <span className="text-destructive">−{file.deletions}</span>
              </span>
            </div>
            <div className="font-mono text-[13px] leading-6 bg-[oklch(0.12_0.008_280)] overflow-x-auto p-4">
              {lines.map((line, i) => {
                let sign = ' ';
                let content = line;
                let bgClass = 'text-foreground/70';
                
                if (line.startsWith('+')) {
                  sign = '+';
                  content = line.substring(1);
                  bgClass = 'bg-success/10 text-success';
                } else if (line.startsWith('-')) {
                  sign = '-';
                  content = line.substring(1);
                  bgClass = 'bg-destructive/10 text-destructive';
                } else if (line.startsWith('@@')) {
                  sign = ' ';
                  bgClass = 'text-electric/70 bg-electric/10';
                } else if (line.startsWith(' ')) {
                  content = line.substring(1);
                }

                return (
                  <div key={i} className={`flex gap-3 px-2 -mx-2 hover:bg-white/5 ${bgClass}`}>
                    <span className="w-4 select-none opacity-50 text-right text-[10px] pt-[2px]">{i + 1}</span>
                    <span className="w-3 select-none">{sign}</span>
                    <span className="flex-1 whitespace-pre">{content}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
