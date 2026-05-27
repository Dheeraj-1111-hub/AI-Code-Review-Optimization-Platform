import { useState, useEffect } from "react";
import Editor, { DiffEditor } from "@monaco-editor/react";
import { FileExplorer } from "./FileExplorer";
import { EditorTabs } from "./EditorTabs";
import { useEditorStore } from "../../store/editor.store";
import { useMonacoDecorations } from "../../hooks/useMonacoDecorations";

export function MonacoWorkspace() {
  const { files, activeFileId, updateFileContent, sidebarOpen, isDiffMode, patchCode, setDiffMode, applyPatch } = useEditorStore();
  const [isMounted, setIsMounted] = useState(false);
  const [editorState, setEditorState] = useState<{ monaco: any; editor: any }>({ monaco: null, editor: null });

  useMonacoDecorations(editorState.monaco, editorState.editor);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeFile = files.find((f) => f.id === activeFileId);

  return (
    <div className="flex w-full h-[600px] border border-border rounded-xl overflow-hidden bg-[#1e1e1e] shadow-xl">
      {sidebarOpen && <FileExplorer />}
      
      <div className="flex-1 flex flex-col min-w-0">
        <EditorTabs />
        
        <div className="flex-1 w-full relative">
          {activeFile ? (
            isMounted ? (
              isDiffMode && patchCode ? (
                <div className="flex flex-col h-full">
                  <div className="px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20 flex items-center justify-between">
                    <span className="text-xs font-semibold text-yellow-500 uppercase tracking-wider">Reviewing AI Refactor Patch</span>
                    <div className="space-x-2">
                      <button onClick={() => setDiffMode(false)} className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                      <button onClick={applyPatch} className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">Accept Fix</button>
                    </div>
                  </div>
                  <DiffEditor
                    height="100%"
                    language={activeFile.language}
                    theme="vs-dark"
                    original={activeFile.content}
                    modified={patchCode}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineHeight: 24,
                      padding: { top: 16, bottom: 16 },
                      scrollBeyondLastLine: false,
                      renderSideBySide: true,
                    }}
                  />
                </div>
              ) : (
                <Editor
                  height="100%"
                language={activeFile.language}
                theme="vs-dark"
                value={activeFile.content}
                onChange={(value) => updateFileContent(activeFile.id, value || "")}
                path={activeFile.path}
                onMount={(editor, monaco) => {
                  setEditorState({ editor, monaco });
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineHeight: 24,
                  padding: { top: 16, bottom: 16 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  wordWrap: "on",
                }}
              />
              )
            ) : (
              <div className="flex-1 w-full h-full flex items-center justify-center text-muted-foreground bg-[#1e1e1e] font-mono text-sm">
                Initializing Editor Environment...
              </div>
            )
          ) : (
            <div className="flex-1 w-full h-full flex items-center justify-center text-muted-foreground bg-[#1e1e1e] flex-col gap-4">
              <div className="text-4xl opacity-20 font-bold tracking-widest uppercase">DevLens</div>
              <p className="text-sm">Select a file from the explorer to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
