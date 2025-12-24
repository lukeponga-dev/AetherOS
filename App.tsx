import React, { useState, useEffect } from 'react';
import { INITIAL_WINDOWS, APP_CONFIG } from './constants';
import { WindowState, AppId, AIResponse, SnapLine } from './types';
import { WindowFrame } from './components/os/WindowFrame';
import { SnapOverlay } from './components/os/SnapOverlay';
import { Dock } from './components/os/Dock';
import { OmniAssistant } from './components/apps/OmniAssistant';
import { Memories } from './components/apps/Memories';
import { FlowAutomation } from './components/apps/FlowAutomation';
import { Browser } from './components/apps/Browser';
import { Studio } from './components/apps/Studio';
import { Wifi, Battery, Command } from 'lucide-react';

const App: React.FC = () => {
  const [windows, setWindows] = useState<WindowState[]>(INITIAL_WINDOWS);
  const [activeWindowId, setActiveWindowId] = useState<string | null>('win-home');
  const [snapLines, setSnapLines] = useState<SnapLine[]>([]);

  // Update initial position on mount
  useEffect(() => {
    setWindows(prev => prev.map(w => {
        if (w.id === 'win-home') {
            return {
                ...w,
                position: { x: window.innerWidth / 2 - 240, y: window.innerHeight / 2 - 325 }
            }
        }
        return w;
    }));
  }, []);

  // OS KERNEL LOGIC
  const openApp = (appId: AppId, context?: any) => {
    const existing = windows.find(w => w.appId === appId);
    if (existing) {
      focusWindow(existing.id);
      if (context) {
        setWindows(prev => prev.map(w => w.id === existing.id ? { ...w, context } : w));
      }
      return;
    }

    const config = APP_CONFIG[appId];
    // Smart positioning: cascade
    const offset = windows.length * 30;
    const newWindow: WindowState = {
      id: `win-${Date.now()}`,
      appId,
      title: config.title,
      isOpen: true,
      isMinimized: false,
      zIndex: getNextZIndex(),
      position: { x: 200 + offset, y: 100 + offset },
      size: config.defaultSize,
      context
    };
    
    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(newWindow.id);
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const focusWindow = (id: string) => {
    setActiveWindowId(id);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: getNextZIndex(), isMinimized: false } : w));
  };

  const toggleMinimize = (id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;
      return { ...w, isMinimized: !w.isMinimized };
    }));
  };

  const updateWindowPosition = (id: string, targetX: number, targetY: number) => {
    const activeWindow = windows.find(w => w.id === id);
    if (!activeWindow) return;

    const { width, height } = activeWindow.size;
    const SNAP = 20;
    
    let newX = targetX;
    let newY = targetY;
    const lines: SnapLine[] = [];

    // Screen Center Snap
    if (Math.abs(targetX + width/2 - window.innerWidth/2) < SNAP) {
        newX = window.innerWidth/2 - width/2;
        lines.push({ id: 'cx', orientation: 'vertical', x: window.innerWidth/2, start: 0, end: window.innerHeight, type: 'center' });
    }
    if (Math.abs(targetY + height/2 - window.innerHeight/2) < SNAP) {
        newY = window.innerHeight/2 - height/2;
        lines.push({ id: 'cy', orientation: 'horizontal', y: window.innerHeight/2, start: 0, end: window.innerWidth, type: 'center' });
    }

    setWindows(prev => prev.map(w => w.id === id ? { ...w, position: { x: newX, y: newY } } : w));
    setSnapLines(lines);
  };

  const handleDragEnd = () => setSnapLines([]);

  const getNextZIndex = () => {
    const max = Math.max(0, ...windows.map(w => w.zIndex));
    return max + 1;
  };

  const handleAICommand = (response: AIResponse) => {
    switch (response.intent) {
      case 'OPEN_APP':
        if (response.appId) openApp(response.appId, response.payload);
        break;
      case 'WEB_SEARCH':
        openApp(AppId.BROWSER, response.payload?.query);
        break;
      case 'SEARCH_FILES':
        openApp(AppId.MEMORIES, response.payload?.query);
        break;
      case 'TOGGLE_SETTING':
        openApp(AppId.FLOW);
        break;
      case 'CREATE_NOTE':
        openApp(AppId.NOTEPAD, response.payload);
        break;
      default:
        break;
    }
  };

  const renderAppContent = (window: WindowState) => {
    switch (window.appId) {
      case AppId.OMNI:
        return <OmniAssistant onCommand={handleAICommand} />;
      case AppId.MEMORIES:
        return <Memories initialQuery={window.context} />;
      case AppId.FLOW:
        return <FlowAutomation />;
      case AppId.BROWSER:
        return <Browser initialQuery={window.context} />;
      case AppId.STUDIO:
        return <Studio />;
      case AppId.NOTEPAD:
        return (
          <div className="p-6 h-full bg-slate-900/50 text-slate-200 flex flex-col">
            <textarea 
              className="w-full h-full bg-transparent outline-none resize-none font-mono text-sm leading-relaxed p-2" 
              placeholder="System Note..." 
              defaultValue={window.context?.content || ''}
            />
          </div>
        );
      default:
        return null;
    }
  };

  // Determine active App ID for the Dock indicator
  const activeAppId = activeWindowId 
    ? windows.find(w => w.id === activeWindowId)?.appId || null 
    : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0f] font-sans text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-100">
      
      {/* Dynamic Desktop Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-900/20 rounded-full blur-[150px] animate-pulse duration-[8s]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[150px] animate-pulse duration-[12s]" />
        <div className="absolute top-[40%] left-[40%] w-[20vw] h-[20vw] bg-cyan-900/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <SnapOverlay lines={snapLines} />

      {/* Top System Bar */}
      <div className="fixed top-0 left-0 w-full h-8 flex justify-between items-center px-4 z-50 pointer-events-none select-none text-white/50 text-[11px] font-medium tracking-wide">
        <div className="flex items-center gap-4">
            <span className="font-bold text-white/70">AETHER</span>
            <span>File</span>
            <span>Edit</span>
            <span>View</span>
            <span>Window</span>
            <span>Help</span>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5"><Wifi size={12} /></div>
            <div className="flex items-center gap-1.5"><Battery size={12} /> <span>100%</span></div>
            <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>

      {/* Desktop Workspace */}
      <div className="relative z-10 w-full h-full pt-8">
        {windows.map(window => (
          <WindowFrame
            key={window.id}
            windowState={window}
            onClose={closeWindow}
            onFocus={focusWindow}
            onMinimize={toggleMinimize}
            onUpdatePosition={updateWindowPosition}
            onDragStart={() => {}}
            onDragEnd={handleDragEnd}
          >
            {renderAppContent(window)}
          </WindowFrame>
        ))}
      </div>

      {/* Dock System */}
      <Dock 
        activeAppId={activeAppId} 
        onOpenApp={openApp} 
        windows={windows} 
      />
      
    </div>
  );
};

export default App;