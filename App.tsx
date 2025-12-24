import React, { useState } from 'react';
import { INITIAL_WINDOWS, APP_CONFIG } from './constants';
import { WindowState, AppId, AIResponse } from './types';
import { WindowFrame } from './components/os/WindowFrame';
import { Dock } from './components/os/Dock';
import { OmniAssistant } from './components/apps/OmniAssistant';
import { Memories } from './components/apps/Memories';
import { FlowAutomation } from './components/apps/FlowAutomation';
import { FileText } from 'lucide-react';

const App: React.FC = () => {
  const [windows, setWindows] = useState<WindowState[]>(INITIAL_WINDOWS);
  const [activeWindowId, setActiveWindowId] = useState<string | null>('win-home');

  // OS KERNEL LOGIC
  const openApp = (appId: AppId, context?: any) => {
    // Check if already open
    const existing = windows.find(w => w.appId === appId);
    if (existing) {
      focusWindow(existing.id);
      if (context) {
        setWindows(prev => prev.map(w => w.id === existing.id ? { ...w, context } : w));
      }
      return;
    }

    // Create new window
    const config = APP_CONFIG[appId];
    const newWindow: WindowState = {
      id: `win-${Date.now()}`,
      appId,
      title: config.title,
      isOpen: true,
      isMinimized: false,
      zIndex: getNextZIndex(),
      position: { x: 100 + windows.length * 40, y: 100 + windows.length * 40 },
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
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: getNextZIndex() } : w));
  };

  const updateWindowPosition = (id: string, x: number, y: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, position: { x, y } } : w));
  };

  const getNextZIndex = () => {
    const max = Math.max(0, ...windows.map(w => w.zIndex));
    return max + 1;
  };

  const handleAICommand = (response: AIResponse) => {
    switch (response.intent) {
      case 'OPEN_APP':
        if (response.appId) openApp(response.appId, response.payload);
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
      case 'CHAT':
      default:
        // Already handled in Omni UI
        break;
    }
  };

  // RENDER APP CONTENT BASED ON ID
  const renderAppContent = (window: WindowState) => {
    switch (window.appId) {
      case AppId.OMNI:
        return <OmniAssistant onCommand={handleAICommand} />;
      case AppId.MEMORIES:
        return <Memories initialQuery={window.context} />;
      case AppId.FLOW:
        return <FlowAutomation />;
      case AppId.NOTEPAD:
        return (
          <div className="p-4 h-full bg-white/50">
            <textarea 
              className="w-full h-full bg-transparent outline-none resize-none font-mono text-sm" 
              placeholder="Start typing..." 
              defaultValue={window.context?.content || ''}
            />
          </div>
        );
      default:
        return <div className="p-10 text-center">App Content Not Loaded</div>;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-100 font-sans text-slate-900 selection:bg-blue-500 selection:text-white">
      {/* Dynamic Mesh Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-400/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-blue-400/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-pink-400/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
      </div>

      {/* OS Desktop Layer */}
      <div className="relative z-10 w-full h-full">
        {windows.map(window => (
          <WindowFrame
            key={window.id}
            windowState={window}
            onClose={closeWindow}
            onFocus={focusWindow}
            onUpdatePosition={updateWindowPosition}
          >
            {renderAppContent(window)}
          </WindowFrame>
        ))}
      </div>

      <Dock onOpenApp={openApp} activeAppId={activeWindowId ? windows.find(w => w.id === activeWindowId)?.appId || null : null} />
      
      {/* Top Bar for aesthetics */}
      <div className="fixed top-0 left-0 w-full h-8 flex justify-between items-center px-6 z-50 pointer-events-none">
        <span className="text-xs font-semibold tracking-widest opacity-40 mix-blend-difference text-white">AETHER OS v1.0</span>
        <div className="flex gap-4 text-xs font-medium opacity-60 mix-blend-difference text-white">
          <span>5G</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export default App;
