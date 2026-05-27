import { FileCode, FolderClosed } from "lucide-react";
import { useEditorStore } from "../../store/editor.store";

export function FileExplorer() {
  const { files, activeFileId, setActiveFile } = useEditorStore();

  return (
    <div className="w-64 border-r border-border bg-[#1e1e1e]/50 flex flex-col h-full shrink-0">
      <div className="px-4 py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase border-b border-border/50">
        Workspace
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {files.map((file) => {
          const isActive = activeFileId === file.id;
          
          return (
            <button
              key={file.id}
              onClick={() => setActiveFile(file.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                isActive 
                  ? "bg-primary/20 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              <FileCode className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="truncate">{file.name}</span>
              {file.isModified && (
                <span className="w-2 h-2 rounded-full bg-yellow-500 ml-auto" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
