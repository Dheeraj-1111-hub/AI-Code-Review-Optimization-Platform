import { X, FileCode } from "lucide-react";
import { useEditorStore } from "../../store/editor.store";

export function EditorTabs() {
  const { files, openTabs, activeFileId, setActiveFile, closeTab } = useEditorStore();

  if (openTabs.length === 0) return null;

  return (
    <div className="flex bg-[#1e1e1e] border-b border-border overflow-x-auto custom-scrollbar">
      {openTabs.map(tabId => {
        const file = files.find(f => f.id === tabId);
        if (!file) return null;
        
        const isActive = activeFileId === tabId;
        
        return (
          <div
            key={tabId}
            onClick={() => setActiveFile(tabId)}
            className={`group flex items-center gap-2 px-4 py-2 min-w-[120px] max-w-[200px] border-r border-border/50 cursor-pointer transition-colors ${
              isActive 
                ? "bg-[#1e1e1e] text-foreground border-t-2 border-t-primary" 
                : "bg-surface/50 text-muted-foreground hover:bg-[#252526] border-t-2 border-t-transparent"
            }`}
          >
            <FileCode className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-primary' : ''}`} />
            <span className="text-sm truncate select-none">{file.name}</span>
            {file.isModified && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tabId);
              }}
              className={`ml-auto p-0.5 rounded hover:bg-surface-hover shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
