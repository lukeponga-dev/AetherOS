import React from 'react';
import { AppId } from '../../types';
import { APP_CONFIG } from '../../constants';
import { GlassCard } from '../ui/GlassCard';

interface DockProps {
  onOpenApp: (appId: AppId) => void;
  activeAppId: string | null;
}

export const Dock: React.FC<DockProps> = ({ onOpenApp, activeAppId }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <GlassCard className="px-3 py-2.5 flex items-center gap-3 !rounded-2xl bg-black/60 border-white/10 shadow-2xl backdrop-blur-xl">
        {(Object.keys(APP_CONFIG) as AppId[]).map((appId) => {
          const config = APP_CONFIG[appId];
          const isActive = activeAppId === appId;
          
          return (
            <button
              key={appId}
              onClick={() => onOpenApp(appId)}
              className="group relative flex flex-col items-center justify-center w-10 h-10 transition-all duration-300 hover:-translate-y-1"
            >
              <div 
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center text-white/90 shadow-lg transition-all border border-white/5
                  ${appId === AppId.OMNI ? 'bg-indigo-600 shadow-indigo-500/30' : 'bg-white/5 hover:bg-white/10'}
                `}
              >
                {config.icon}
              </div>
              
              {/* Tooltip */}
              <span className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] tracking-wide font-medium bg-black/80 border border-white/10 text-white px-2 py-1 rounded-md pointer-events-none whitespace-nowrap backdrop-blur-md">
                {config.title}
              </span>

              {/* Active Indicator */}
              <div className={`absolute -bottom-1 w-8 h-[2px] rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
            </button>
          );
        })}
      </GlassCard>
    </div>
  );
};