import React, { useState, useEffect } from 'react';
import { INITIAL_WINDOWS, APP_CONFIG } from './constants';
import { WindowState, AppId, AIResponse, SnapLine } from './types';
import { WindowFrame } from './components/os/WindowFrame';
import { SnapOverlay } from './components/os/SnapOverlay';
import { CommandCenter } from './components/os/CommandCenter';
import { ContextRail } from './components/os/ContextRail';
import { OmniAssistant } from './components/apps/OmniAssistant';
import { Memories } from './components/apps/Memories';
import { FlowAutomation } from './components/apps/FlowAutomation';
import { Browser } from './components/apps/Browser';
import { Studio } from './components/apps/Studio';

const App: React.FC = () => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [snapLines, setSnapLines] = useState<SnapLine[]>([]);
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  // OS KERNEL LOGIC
  const openApp = (appId: AppId, context?: any) => {
    // Check if app is already open
    const existing = windows.find(w => w.appId === appId);
    if (existing) {
      focusWindow(existing.id);
      if (context) {
        setWindows(prev => prev.map(w => w.id === existing.id ? { ...w, context } : w));
      }
      return;
    }

    const config = APP_CONFIG[appId];
    // Smart positioning: Center screen with random offset for organic feel
    const randomOffset = (Math.random() - 0.5) * 40;
    const newWindow: WindowState = {
      id: `win-${Date.now()}`,
      appId,
      title: config.title,
      isOpen: true,
      isMinimized: false,
      zIndex: getNextZIndex(),
      position: { 
        x: window.innerWidth / 2 - config.defaultSize.width / 2 + randomOffset, 
        y: window.innerHeight / 2 - config.defaultSize.height / 2 + randomOffset 
      },
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
    // Basic clamping to screen
    setWindows(prev => prev.map(w => w.id === id ? { ...w, position: { x: targetX, y: targetY } } : w));
  };

  const getNextZIndex = () => {
    const max = Math.max(0, ...windows.map(w => w.zIndex));
    return max + 1;
  };

  const handleAICommand = async (response: AIResponse) => {
    setIsAIProcessing(false);
    
    // Slight delay to make it feel like the OS is "thinking" / animating
    await new Promise(r => setTimeout(r, 300));

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
      case 'CHAT':
        openApp(AppId.OMNI, { mode: 'chat', initialMessage: response.message });
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
          <div className="p-8 h-full bg-[#1a1b26]/50 text-slate-200 flex flex-col font-serif">
             <h1 className="text-2xl opacity-50 mb-4">Thought Stream</h1>
             <div className="w-full h-[1px] bg-white/10 mb-6" />
            <textarea 
              className="w-full h-full bg-transparent outline-none resize-none text-lg leading-relaxed p-2 placeholder:text-slate-600" 
              placeholder="Start typing..." 
              defaultValue={window.context?.content || ''}
              autoFocus
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050508] font-sans text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-100">
      
      {/* Dynamic Ambient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Deep Void Gradients */}
        <div className="absolute top-[-50%] left-[-20%] w-[80vw] h-[80vw] bg-blue-950/10 rounded-full blur-[180px] opacity-40 animate-pulse duration-[15s]" />
        <div className="absolute bottom-[-50%] right-[-20%] w-[80vw] h-[80vw] bg-purple-950/10 rounded-full blur-[180px] opacity-40 animate-pulse duration-[20s]" />
        
        {/* Subtle Noise */}
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Central Light Hint */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-cyan-900/5 rounded-full blur-[120px]" />
      </div>

      <SnapOverlay lines={snapLines} />

      {/* Main Interaction Layer */}
      <div className="relative z-10 w-full h-full">
        {windows.map(window => (
          <WindowFrame
            key={window.id}
            windowState={window}
            onClose={closeWindow}
            onFocus={focusWindow}
            onMinimize={toggleMinimize}
            onUpdatePosition={updateWindowPosition}
          >
            {renderAppContent(window)}
          </WindowFrame>
        ))}
      </div>

      {/* OS Interface Elements */}
      <ContextRail 
        windows={windows} 
        activeId={activeWindowId} 
        onFocus={focusWindow} 
        onClose={closeWindow}
      />
      
      <CommandCenter 
        onCommand={(res) => { setIsAIProcessing(true); handleAICommand(res); }} 
        isProcessing={isAIProcessing}
      />
      
      {/* Initial State Hint */}
      {windows.length === 0 && !isAIProcessing && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-30">
            <h1 className="text-4xl font-extralight tracking-tight text-white/50 mb-2">AETHER</h1>
            <p className="text-sm font-light text-slate-500 tracking-widest uppercase">System Online</p>
        </div>
      )}

    </div>
  );
};

export default App;