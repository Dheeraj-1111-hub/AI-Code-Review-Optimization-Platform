import { useEffect, useRef } from 'react';
import { useAIStore } from '@/store/ai.store';

export function useMonacoDecorations(monaco: any, editor: any) {
  const { agentResults, staticIssues } = useAIStore();
  const decorationsCollectionRef = useRef<any>(null);

  useEffect(() => {
    if (!monaco || !editor) return;

    const newDecorations: any[] = [];

    // Map AI agent issues to decorations
    agentResults.forEach((agent) => {
      if (agent.issues && Array.isArray(agent.issues)) {
        agent.issues.forEach((issue) => {
          if (issue.line) {
            const severityClass = issue.severity === 'critical' ? 'monaco-error' : 'monaco-warning';
            newDecorations.push({
              range: new monaco.Range(issue.line, 1, issue.line, 1),
              options: {
                isWholeLine: true,
                className: `bg-${issue.severity === 'critical' ? 'red' : 'yellow'}-500/10`,
                glyphMarginClassName: severityClass,
                hoverMessage: [
                  { value: `**${agent.agent_name} Agent [${issue.severity}]**` },
                  { value: issue.title || 'Finding' },
                  { value: issue.description || issue.suggestion || 'Review this line.' }
                ]
              }
            });
          }
        });
      }
    });

    // Map static analysis issues
    if (staticIssues && Array.isArray(staticIssues)) {
      staticIssues.forEach((issue) => {
        if (issue.line) {
          newDecorations.push({
            range: new monaco.Range(issue.line, 1, issue.line, 1),
            options: {
              isWholeLine: true,
              className: 'bg-blue-500/10',
              glyphMarginClassName: 'monaco-info',
              hoverMessage: [
                { value: `**Static Analysis**` },
                { value: issue.message || 'Static finding' }
              ]
            }
          });
        }
      });
    }

    // Apply decorations
    if (decorationsCollectionRef.current) {
      decorationsCollectionRef.current.clear();
    }
    
    decorationsCollectionRef.current = editor.createDecorationsCollection(newDecorations);

  }, [monaco, editor, agentResults, staticIssues]);
}
