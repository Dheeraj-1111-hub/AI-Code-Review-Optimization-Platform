import { create } from 'zustand';

export interface VirtualFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isModified?: boolean;
}

interface EditorState {
  files: VirtualFile[];
  activeFileId: string | null;
  openTabs: string[];
  sidebarOpen: boolean;
  isDiffMode: boolean;
  patchCode: string | null;
  
  // Actions
  addFile: (file: VirtualFile) => void;
  setActiveFile: (id: string) => void;
  openTab: (id: string) => void;
  closeTab: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  toggleSidebar: () => void;
  setDiffMode: (active: boolean, patch?: string) => void;
  applyPatch: () => void;
}

const DEFAULT_FILE: VirtualFile = {
  id: 'checkout.ts',
  name: 'checkout.ts',
  path: 'src/checkout.ts',
  language: 'typescript',
  content: `export async function processCheckout(cart: Cart) {
  const total = 0;
  for (let i = 0; i < cart.items.length; i++) {
    for (let j = 0; j < cart.items.length; j++) {
      total += cart.items[i].price * qty;
    }
  }
  const sql = "SELECT * FROM users WHERE id=" + cart.userId;
  return await db.query(sql);
}`,
};

export const useEditorStore = create<EditorState>((set) => ({
  files: [DEFAULT_FILE],
  activeFileId: DEFAULT_FILE.id,
  openTabs: [DEFAULT_FILE.id],
  sidebarOpen: true,
  isDiffMode: false,
  patchCode: null,

  addFile: (file) => set((state) => {
    const exists = state.files.some(f => f.id === file.id);
    if (exists) return state;
    return { files: [...state.files, file] };
  }),

  setActiveFile: (id) => set((state) => {
    // If setting active file, ensure it's in openTabs
    const newTabs = state.openTabs.includes(id) 
      ? state.openTabs 
      : [...state.openTabs, id];
    return { activeFileId: id, openTabs: newTabs };
  }),

  openTab: (id) => set((state) => {
    if (state.openTabs.includes(id)) {
      return { activeFileId: id };
    }
    return { openTabs: [...state.openTabs, id], activeFileId: id };
  }),

  closeTab: (id) => set((state) => {
    const newTabs = state.openTabs.filter(t => t !== id);
    let newActive = state.activeFileId;
    if (state.activeFileId === id) {
      newActive = newTabs.length > 0 ? newTabs[newTabs.length - 1] : null;
    }
    return { openTabs: newTabs, activeFileId: newActive };
  }),

  updateFileContent: (id, content) => set((state) => ({
    files: state.files.map(f => f.id === id ? { ...f, content, isModified: true } : f)
  })),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setDiffMode: (active, patch) => set({ 
    isDiffMode: active, 
    patchCode: patch !== undefined ? patch : null 
  }),

  applyPatch: () => set((state) => {
    if (!state.activeFileId || !state.patchCode) return state;
    
    return {
      files: state.files.map(f => 
        f.id === state.activeFileId 
          ? { ...f, content: state.patchCode!, isModified: true } 
          : f
      ),
      isDiffMode: false,
      patchCode: null
    };
  }),
}));
