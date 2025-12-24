import React from 'react';
import { AppId, FileItem } from './types';
import { LayoutGrid, Sparkles, FolderGit2, FileText, Settings, Zap } from 'lucide-react';

export const INITIAL_FILES: FileItem[] = [
  { id: '1', name: 'Q3_Financial_Report.pdf', type: 'doc', date: '2 days ago', tags: ['finance', 'work'], size: '2.4 MB' },
  { id: '2', name: 'App_Icon_V2.png', type: 'image', date: '1 hour ago', tags: ['design', 'assets'], size: '4.1 MB' },
  { id: '3', name: 'main_loop.tsx', type: 'code', date: 'Yesterday', tags: ['dev', 'react'], size: '12 KB' },
  { id: '4', name: 'Meeting_Recording_Sync.mp3', type: 'audio', date: 'Last week', tags: ['meeting', 'voice'], size: '15 MB' },
  { id: '5', name: 'Project_Alpha_Brief.docx', type: 'doc', date: '3 weeks ago', tags: ['work', 'planning'], size: '1.2 MB' },
  { id: '6', name: 'Gradient_Mesh_01.jpg', type: 'image', date: 'Today', tags: ['design', 'inspiration'], size: '8.5 MB' },
];

export const APP_CONFIG = {
  [AppId.OMNI]: { title: 'Omni Assistant', icon: <Sparkles className="w-6 h-6" />, defaultSize: { width: 500, height: 600 } },
  [AppId.MEMORIES]: { title: 'Memories', icon: <FolderGit2 className="w-6 h-6" />, defaultSize: { width: 800, height: 550 } },
  [AppId.FLOW]: { title: 'Flow Automations', icon: <Zap className="w-6 h-6" />, defaultSize: { width: 450, height: 500 } },
  [AppId.NOTEPAD]: { title: 'Notes', icon: <FileText className="w-6 h-6" />, defaultSize: { width: 400, height: 400 } },
};

export const INITIAL_WINDOWS = [
  {
    id: 'win-home',
    appId: AppId.OMNI,
    title: 'Omni',
    isOpen: true,
    isMinimized: false,
    zIndex: 10,
    position: { x: window.innerWidth / 2 - 250, y: 100 },
    size: { width: 500, height: 600 },
  }
];
