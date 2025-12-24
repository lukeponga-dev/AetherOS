import React, { useState } from 'react';
import { AppId, WindowState } from '../../types';
import { APP_CONFIG } from '../../constants';
import { GlassCard } from '../ui/GlassCard';

interface DockProps {
  onOpenApp: (appId: AppId) => void;
  activeAppId: string | null;
  windows: WindowState[];
}

export const Dock: React.FC<DockProps> = ({ onOpenApp, activeAppId, windows }) => {
  const [hoveredAppId, setHoveredAppId] = useState<AppId | null>(null);

  const getPreviewContent = (appId: AppId, context: any) => {
    switch (appId) {
        case AppId.OMNI:
            return (
                <div className="space-y-2">
                    <div className="h-2 w-3/4 bg-white/20 rounded animate-pulse" />
                    <div className="h-2 w-1/2 bg-white/10 rounded" />
                </div>
            );
        case AppId.MEMORIES:
            return (
                <div className="grid grid-cols-3 gap-1">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-square bg-white/10 rounded-[2px]" />)}
                </div>
            );
        case AppId.BROWSER:
             return (
                <div className="flex flex-col gap-1">
                    <div className="h-1.5 w-full bg-white/10 rounded mb-1" />
                    <div className="h-2 w-2/3 bg-cyan-500/20 rounded" />
                    <div className="text-[8px] text-slate-400 mt-1 truncate">{context || 'New Tab'}</div>
                </div>
            );
        case AppId.STUDIO:
             return (
                <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full border border-white/20" />
                </div>
            );
        default:
            return <div className="text-[9px] text-slate-500">Running...</div>;
    }
  };

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex items-center">
      <GlassCard className="py-3 px-2.5 flex flex-col items-center gap-4 !rounded-2xl bg-black/60 border-white/10 shadow-2xl backdrop-blur-xl relative">
        {(Object.keys(APP_CONFIG) as AppId[]).map((appId) => {
          const config = APP_CONFIG[appId];
          const isActive = activeAppId === appId;
          const appWindows = windows.filter(w => w.appId === appId);
          const isOpen = appWindows.length > 0;
          
          return (
            <div 
                key={appId} 
                className="relative"
                onMouseEnter={() => setHoveredAppId(appId)}
                onMouseLeave={() => setHoveredAppId(null)}
            >
              {/* Live Preview Tooltip */}
              {hoveredAppId === appId && isOpen && (
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-[60] animate-in fade-in slide-in-from-left-2 duration-200">
                    {appWindows.map(win => (
                        <div key={win.id} className="w-40 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl">
                             <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-1">
                                <div className="w-2 h-2 rounded-full bg-white/20" />
                                <span className="text-[10px] font-medium text-slate-300 truncate">{win.title}</span>
                             </div>
                             <div className="h-16 bg-black/40 rounded-lg p-2 overflow-hidden border border-white/5">
                                 {getPreviewContent(appId, win.context)}
                             </div>
                        </div>
                    ))}
                  </div>
              )}

              <button
                onClick={() => onOpenApp(appId)}
                className="group relative flex items-center justify-center w-10 h-10 transition-all duration-300 hover:translate-x-1"
              >
                {/* Active Indicator (Vertical Bar on Left) */}
                <div className={`absolute -left-3 w-[3px] h-5 rounded-r-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all duration-500 ${isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50'}`} />
                
                {/* Open Indicator (Dot on right) */}
                {isOpen && !isActive && (
                     <div className="absolute -right-1 w-1 h-1 rounded-full bg-white/40" />
                )}

                <div 
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center text-white/90 shadow-lg transition-all border border-white/5
                    ${appId === AppId.OMNI ? 'bg-indigo-600 shadow-indigo-500/30' : 'bg-white/5 hover:bg-white/10'}
                  `}
                >
                  {config.icon}
                </div>
                
                {/* Simple Label Tooltip (only if not previewing) */}
                {!isOpen && (
                    <span className="absolute left-14 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] tracking-wide font-medium bg-black/80 border border-white/10 text-white px-2 py-1 rounded-md pointer-events-none whitespace-nowrap backdrop-blur-md shadow-xl z-50">
                        {config.title}
                    </span>
                )}
              </button>
            </div>
          );
        })}
      </GlassCard>
    </div>
  );
};