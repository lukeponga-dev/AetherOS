
export enum AppId {
  OMNI = 'omni', // The AI Assistant / Home
  MEMORIES = 'memories', // Smart Files
  FLOW = 'flow', // Automation
  NOTEPAD = 'notepad', // Simple editor
  BROWSER = 'browser', // AI Web Browser
  STUDIO = 'studio' // Creative Suite
}

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  context?: any; // Extra data passed by AI (e.g., search query)
}

export interface FileItem {
  id: string;
  name: string;
  type: 'image' | 'doc' | 'code' | 'audio';
  date: string;
  tags: string[];
  size: string;
}

export interface AIResponse {
  intent: 'OPEN_APP' | 'SEARCH_FILES' | 'CREATE_NOTE' | 'TOGGLE_SETTING' | 'CHAT' | 'WEB_SEARCH';
  appId?: AppId;
  payload?: any;
  message?: string;
}

export interface SystemTheme {
  primary: string;
  accent: string;
  background: string;
}

export interface SnapLine {
  id: string;
  orientation: 'vertical' | 'horizontal';
  x?: number;
  y?: number;
  start: number;
  end: number;
  type: 'screen' | 'window' | 'center';
}