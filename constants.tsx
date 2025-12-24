import React from 'react';
import { AppId, FileItem, WindowState } from './types';
import { Sparkles, FolderGit2, FileText, Zap, Globe, Palette } from 'lucide-react';

export const INITIAL_FILES: FileItem[] = [
  { id: '1', name: 'Q3_Financial_Report.pdf', type: 'doc', date: '2 days ago', tags: ['finance', 'work'], size: '2.4 MB' },
  { id: '2', name: 'App_Icon_V2.png', type: 'image', date: '1 hour ago', tags: ['design', 'assets'], size: '4.1 MB' },
  { id: '3', name: 'main_loop.tsx', type: 'code', date: 'Yesterday', tags: ['dev', 'react'], size: '12 KB' },
  { id: '4', name: 'Meeting_Recording_Sync.mp3', type: 'audio', date: 'Last week', tags: ['meeting', 'voice'], size: '15 MB' },
  { id: '5', name: 'Project_Alpha_Brief.docx', type: 'doc', date: '3 weeks ago', tags: ['work', 'planning'], size: '1.2 MB' },
  { id: '6', name: 'Gradient_Mesh_01.jpg', type: 'image', date: 'Today', tags: ['design', 'inspiration'], size: '8.5 MB' },
];

export const APP_CONFIG = {
  [AppId.OMNI]: { title: 'Omni Intelligence', icon: <Sparkles className="w-5 h-5" />, defaultSize: { width: 480, height: 650 } },
  [AppId.MEMORIES]: { title: 'Memories', icon: <FolderGit2 className="w-5 h-5" />, defaultSize: { width: 850, height: 600 } },
  [AppId.FLOW]: { title: 'Flow Automations', icon: <Zap className="w-5 h-5" />, defaultSize: { width: 500, height: 600 } },
  [AppId.NOTEPAD]: { title: 'Notes', icon: <FileText className="w-5 h-5" />, defaultSize: { width: 500, height: 500 } },
  [AppId.BROWSER]: { title: 'Quantum Browser', icon: <Globe className="w-5 h-5" />, defaultSize: { width: 900, height: 650 } },
  [AppId.STUDIO]: { title: 'Creative Studio', icon: <Palette className="w-5 h-5" />, defaultSize: { width: 800, height: 700 } },
};

export const INITIAL_WINDOWS: WindowState[] = [
  {
    id: 'win-home',
    appId: AppId.OMNI,
    title: 'Omni Intelligence',
    isOpen: true,
    isMinimized: false,
    zIndex: 10,
    position: { x: window.innerWidth / 2 - 240, y: window.innerHeight / 2 - 325 },
    size: { width: 480, height: 650 }
  }
];