import React from 'react';
import { WindowState, AppId } from '../../types';
import { APP_CONFIG } from '../../constants';

interface ContextRailProps {
  windows: WindowState[];
  activeId: string | null;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
}

export const ContextRail: React.FC<ContextRailProps> = ({ windows, activeId, onFocus, onClose }) => {
  if (windows.length === 0) return null;

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-6">
      {windows.map((win) => {
        const isActive = activeId === win.id;
        const config = APP_CONFIG[win.appId];
        
        return (
          <div key={win.id} className="group relative flex items-center">
            {/* Context Label (Left of the dot) */}
            <div 
                onClick={() => onFocus(win.id)}
                className={`
                    absolute left-8 whitespace-nowrap px-3 py-1.5 rounded-lg backdrop-blur-md border transition-all duration-300 cursor-pointer
                    ${isActive 
                        ? 'bg-white/10 border-white/10 text-white opacity-100 translate-x-0' 
                        : 'bg-black/40 border-transparent text-slate-500 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'}
                `}
            >
                <span className="text-xs font-medium tracking-wide">{win.title}</span>
            </div>

            {/* The Dot / Indicator */}
            <button
              onClick={() => onFocus(win.id)}
              className={`
                relative w-1.5 h-1.5 rounded-full transition-all duration-500
                ${isActive ? 'bg-cyan-400 scale-150 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-slate-600 hover:bg-slate-400'}
              `}
            >
                {/* Vertical Line Connection (Conceptual) */}
            </button>
            
            {/* Active Line Indicator */}
             <div className={`absolute -left-6 w-[2px] h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />

          </div>
        );
      })}
    </div>
  );
};