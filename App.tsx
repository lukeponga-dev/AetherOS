import React, { useState } from 'react';
import { INITIAL_WINDOWS, APP_CONFIG } from './constants';
import { WindowState, AppId, AIResponse } from './types';
import { WindowFrame } from './components/os/WindowFrame';
import { Dock } from './components/os/Dock';
import { OmniAssistant } from './components/apps/OmniAssistant';
import { Memories } from './components/apps/Memories';
import { FlowAutomation } from './components/apps/FlowAutomation';
import { FileText, Wifi, Battery } from 'lucide-react';

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

  const updateWindowPosition = (id: string, targetX: number, targetY: number) => {
    setWindows(prev => {
      const activeWindow = prev.find(w => w.id === id);
      if (!activeWindow) return prev;

      const { width, height } = activeWindow.size;
      const SNAP_THRESHOLD = 20;
      
      let newX = targetX;
      let newY = targetY;

      // Find closest snap points
      let minDiffX = SNAP_THRESHOLD;
      let minDiffY = SNAP_THRESHOLD;

      // --- 1. Screen Edges ---
      // Left
      if (Math.abs(targetX) < minDiffX) {
          newX = 0;
          minDiffX = Math.abs(targetX);
      }
      // Top
      if (Math.abs(targetY) < minDiffY) {
          newY = 0;
          minDiffY = Math.abs(targetY);
      }
      // Right
      if (Math.abs(window.innerWidth - (targetX + width)) < minDiffX) {
          newX = window.innerWidth - width;
          minDiffX = Math.abs(window.innerWidth - (targetX + width));
      }
      // Bottom
      if (Math.abs(window.innerHeight - (targetY + height)) < minDiffY) {
          newY = window.innerHeight - height;
          minDiffY = Math.abs(window.innerHeight - (targetY + height));
      }

      // --- 2. Other Windows ---
      prev.forEach(other => {
        if (other.id === id || !other.isOpen || other.isMinimized) return;
        
        const otherL = other.position.x;
        const otherR = other.position.x + other.size.width;
        const otherT = other.position.y;
        const otherB = other.position.y + other.size.height;

        // X Snapping
        if (Math.abs(targetX - otherR) < minDiffX) {
           newX = otherR;
           minDiffX = Math.abs(targetX - otherR);
        }
        if (Math.abs((targetX + width) - otherL) < minDiffX) {
           newX = otherL - width;
           minDiffX = Math.abs((targetX + width) - otherL);
        }
        if (Math.abs(targetX - otherL) < minDiffX) {
           newX = otherL;
           minDiffX = Math.abs(targetX - otherL);
        }
        if (Math.abs((targetX + width) - otherR) < minDiffX) {
           newX = otherR - width;
           minDiffX = Math.abs((targetX + width) - otherR);
        }

        // Y Snapping
        if (Math.abs(targetY - otherB) < minDiffY) {
           newY = otherB;
           minDiffY = Math.abs(targetY - otherB);
        }
        if (Math.abs((targetY + height) - otherT) < minDiffY) {
           newY = otherT - height;
           minDiffY = Math.abs((targetY + height) - otherT);
        }
        if (Math.abs(targetY - otherT) < minDiffY) {
           newY = otherT;
           minDiffY = Math.abs(targetY - otherT);
        }
        if (Math.abs((targetY + height) - otherB) < minDiffY) {
           newY = otherB - height;
           minDiffY = Math.abs((targetY + height) - otherB);
        }
      });

      return prev.map(w => w.id === id ? { ...w, position: { x: newX, y: newY } } : w);
    });
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
          <div className="p-4 h-full bg-slate-900/50 text-slate-200">
            <textarea 
              className="w-full h-full bg-transparent outline-none resize-none font-mono text-sm leading-relaxed" 
              placeholder="Start typing..." 
              defaultValue={window.context?.content || ''}
            />
          </div>
        );
      default:
        return <div className="p-10 text-center text-slate-400">App Content Not Loaded</div>;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-100">
      {/* Deep Obsidian Gradient Background */}
      <div className="absolute inset-0 z-0 bg-[#020617]">
        {/* Subtle nebulae */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-900/20 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '15s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-violet-900/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '20s' }} />
        <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] bg-slate-800/20 rounded-full blur-[100px]" />
        
        {/* Noise overlay for texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
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
      
      {/* Top Bar - Minimal Status */}
      <div className="fixed top-0 left-0 w-full h-10 flex justify-between items-center px-6 z-50 pointer-events-none select-none">
        <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold tracking-[0.2em] opacity-50 text-white uppercase">Aether OS</span>
        </div>
        <div className="flex gap-6 text-[11px] font-medium opacity-60 text-white items-center">
          <div className="flex items-center gap-2">
            <Wifi size={14} />
            <span>5G</span>
          </div>
          <div className="flex items-center gap-2">
            <span>100%</span>
            <Battery size={14} />
          </div>
          <span>Oct 24 2:45 PM</span>
        </div>
      </div>
    </div>
  );
};

export default App;