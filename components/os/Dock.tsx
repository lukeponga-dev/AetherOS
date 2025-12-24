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
      <GlassCard className="px-4 py-3 flex items-center gap-4 !rounded-full bg-white/20 dark:bg-black/40 border-white/20 shadow-2xl backdrop-blur-3xl">
        {(Object.keys(APP_CONFIG) as AppId[]).map((appId) => {
          const config = APP_CONFIG[appId];
          const isActive = activeAppId === appId; // Simple check, usually would check if window open
          
          return (
            <button
              key={appId}
              onClick={() => onOpenApp(appId)}
              className="group relative flex flex-col items-center justify-center w-12 h-12 transition-all duration-300 hover:-translate-y-2"
            >
              <div 
                className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all
                  ${appId === AppId.OMNI ? 'bg-gradient-to-br from-blue-500 to-purple-600' : ''}
                  ${appId === AppId.MEMORIES ? 'bg-gradient-to-br from-orange-400 to-pink-500' : ''}
                  ${appId === AppId.FLOW ? 'bg-gradient-to-br from-emerald-400 to-cyan-500' : ''}
                  ${appId === AppId.NOTEPAD ? 'bg-gradient-to-br from-slate-500 to-slate-700' : ''}
                `}
              >
                {config.icon}
              </div>
              
              {/* Tooltip */}
              <span className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium bg-slate-800 text-white px-2 py-1 rounded-md pointer-events-none whitespace-nowrap">
                {config.title}
              </span>

              {/* Active Indicator */}
              <div className={`absolute -bottom-2 w-1 h-1 rounded-full bg-white transition-all ${isActive ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          );
        })}
      </GlassCard>
    </div>
  );
};
